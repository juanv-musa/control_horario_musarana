import { APP_CONFIG } from './config.js';

const supabaseClient = supabase.createClient(APP_CONFIG.supabase.url, APP_CONFIG.supabase.key);

export const Store = {
    async init() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) await this.refreshCurrentUser(session.user.id);
    },
    async refreshCurrentUser(userId) {
        const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', userId).single();
        if (profile) { localStorage.setItem('currentUser', JSON.stringify(profile)); return profile; }
        return null;
    },
    async login(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) { this.showToast(error.message, 'error'); return null; }
        return await this.refreshCurrentUser(data.user.id);
    },
    async logout() { await supabaseClient.auth.signOut(); localStorage.removeItem('currentUser'); },
    async loginWithCode(code) {
        const AUDITOR_EMAIL = 'auditoria@musarana.cloud';
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email: AUDITOR_EMAIL, password: code });
        if (error) { this.showToast('Código incorrecto', 'error'); return null; }
        const profile = await this.refreshCurrentUser(data.user.id);
        if (profile) await this.logAuditAccess(profile.full_name);
        return profile;
    },
    getUser() { const data = localStorage.getItem('currentUser'); return data ? JSON.parse(data) : null; },
    async updateProfile(userId, newName, newPassword) {
        await supabaseClient.from('profiles').update({ full_name: newName }).eq('id', userId);
        if (newPassword) await supabaseClient.auth.updateUser({ password: newPassword });
        await this.refreshCurrentUser(userId);
        return true;
    },
    async adminGetAllUsers() { const { data } = await supabaseClient.from('profiles').select('*'); return data || []; },
    async adminSaveUser(userData) {
        if (userData.id) {
            await supabaseClient.from('profiles').update({ full_name: userData.name, role: userData.role }).eq('id', userData.id);
            return { success: true };
        } else {
            const { data, error } = await supabaseClient.auth.signUp({ email: userData.username, password: userData.password, options: { data: { full_name: userData.name, role: userData.role } } });
            if (error) return { success: false, error: error.message };
            await supabaseClient.from('profiles').upsert({ id: data.user.id, full_name: userData.name, role: userData.role });
            return { success: true };
        }
    },
    async adminDeleteUser(userId) { await supabaseClient.from('profiles').delete().eq('id', userId); return { success: true }; },
    getAvailableMonths(records) {
        const months = new Set();
        records.forEach(r => { const d = new Date(r.timestamp); months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); });
        const now = new Date(); months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
        return Array.from(months).sort((a,b) => b.localeCompare(a));
    },
    formatMonthLabel(yymm) {
        const [y, m] = yymm.split('-');
        const d = new Date(y, parseInt(m) - 1, 1);
        return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
    },
    async calculateMonthlyHours(userId, monthString = null) {
        let y, m;
        if (monthString) { const p = monthString.split('-'); y = parseInt(p[0]); m = parseInt(p[1]) - 1; }
        else { const n = new Date(); y = n.getFullYear(); m = n.getMonth(); }
        const start = new Date(y, m, 1).toISOString();
        const end = new Date(y, m + 1, 0, 23, 59, 59).toISOString();
        const { data: recs } = await supabaseClient.from('time_records').select('*').eq('user_id', userId).gte('timestamp', start).lte('timestamp', end).order('timestamp', { ascending: true });
        if (!recs) return 0;
        let total = 0; let lastIn = null;
        for (const r of recs) { if (r.type === 'IN') lastIn = new Date(r.timestamp); else if (r.type === 'OUT' && lastIn) { total += (new Date(r.timestamp) - lastIn); lastIn = null; } }
        return total;
    },
    formatTime(ms) {
        if (!ms) return '0h 0m';
        const total = Math.floor(ms / 60000);
        return `${Math.floor(total / 60)}h ${total % 60}m`;
    },
    async getRecords(filters = {}) {
        let q = supabaseClient.from('time_records').select('*');
        if (filters.userId && filters.userId !== 'ALL') q = q.eq('user_id', filters.userId);
        if (filters.month) { const [y, m] = filters.month.split('-'); q = q.gte('timestamp', new Date(y, m - 1, 1).toISOString()).lte('timestamp', new Date(y, m, 0, 23, 59, 59).toISOString()); }
        const { data } = await q.order('timestamp', { ascending: false });
        return data || [];
    },
    async clockAction(userId, type, notes = '') {
        const user = this.getUser();
        const { data } = await supabaseClient.from('time_records').insert({ user_id: userId, user_name: user.full_name, type, notes: notes.trim() }).select().single();
        return data;
    },
    async adminUpdateRecord(recordId, newData) { await supabaseClient.from('time_records').update({ timestamp: newData.timestamp, type: newData.type, notes: (newData.notes || '').trim() }).eq('id', recordId); return true; },
    async adminAddRecord(userId, userName, timestamp, type, notes) { await supabaseClient.from('time_records').insert({ user_id: userId, user_name: userName, timestamp, type, notes: (notes || '').trim() }); return true; },
    async getEmployeeStatus(userId) { const { data } = await supabaseClient.from('time_records').select('type').eq('user_id', userId).order('timestamp', { ascending: false }).limit(1).single(); return data ? data.type : 'OUT'; },
    async getLastClockIn(userId) { const { data } = await supabaseClient.from('time_records').select('timestamp').eq('user_id', userId).eq('type', 'IN').order('timestamp', { ascending: false }).limit(1).single(); return data; },
    async validateMonth(userId, monthYear) { const [y, m] = monthYear.split('-'); await supabaseClient.from('time_records').update({ is_validated: true, validation_date: new Date().toISOString() }).eq('user_id', userId).gte('timestamp', new Date(y, m - 1, 1).toISOString()).lte('timestamp', new Date(y, m, 0, 23, 59, 59).toISOString()); return true; },
    async companyValidateMonth(userId, monthYear) { const [y, m] = monthYear.split('-'); await supabaseClient.from('time_records').update({ is_company_validated: true, company_validation_date: new Date().toISOString() }).eq('user_id', userId).gte('timestamp', new Date(y, m - 1, 1).toISOString()).lte('timestamp', new Date(y, m, 0, 23, 59, 59).toISOString()); return true; },
    async getDashboardStats() {
        const emps = (await this.adminGetAllUsers()).filter(p => p.role === 'employee');
        const today = new Date().toISOString().split('T')[0];
        const { data: recsToday } = await supabaseClient.from('time_records').select('id').gte('timestamp', `${today}T00:00:00Z`).lte('timestamp', `${today}T23:59:59Z`);
        let active = 0; for (const e of emps) if (await this.getEmployeeStatus(e.id) === 'IN') active++;
        return { todayRecords: recsToday ? recsToday.length : 0, activeCount: active };
    },
    async logAuditAccess(auditorName) { try { await supabaseClient.from('audit_logs').insert({ auditor_name: auditorName, access_type: 'LOGIN_PORTAL', user_agent: navigator.userAgent }); } catch (e) { console.warn(e); } },
    async getAuditLogs() { const { data } = await supabaseClient.from('audit_logs').select('*').order('created_at', { ascending: false }); return data || []; },
    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container'); if (!c) return;
        const t = document.createElement('div'); t.className = `toast ${type}`; t.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()" style="margin-left:1rem;background:none;border:none;color:inherit;cursor:pointer;">&times;</button>`;
        c.appendChild(t); setTimeout(() => t.remove(), 3000);
    },
    async exportEmployeeCSV(empId, monthId) {
        const records = await this.getRecords({ userId: empId, month: monthId === 'ALL' ? null : monthId });
        const users = await this.adminGetAllUsers();
        let name = `auditoria_${APP_CONFIG.name}_${monthId}.csv`;
        if (records.length === 0) { this.showToast('Sin registros', 'error'); return; }
        const csv = [["ID Registro", "Empleado", "Timestamp", "Tipo", "Notas", "Firma Empleado", "Firma Empresa"].join(',')];
        records.forEach(r => csv.push([r.id, `"${r.user_name}"`, r.timestamp, r.type, `"${r.notes || ''}"`, r.is_validated ? 'SI' : 'NO', r.is_company_validated ? 'SI' : 'NO'].join(',')));
        if (empId !== 'ALL') {
            const h = await this.calculateMonthlyHours(empId, monthId === 'ALL' ? null : monthId);
            const first = records[0] || {};
            csv.push('', '--- RESUMEN LEGAL ---');
            csv.push(`"TOTAL HORAS","${this.formatTime(h)}"`);
            csv.push(`"Certificación Empleado","${first.is_validated ? 'SI' : 'NO'}"`);
            csv.push(`"Certificación Empresa","${first.is_company_validated ? 'SI' : 'NO'}"`);
        }
        const blob = new Blob(["\ufeff" + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; link.click();
        this.showToast('OK');
    }
};
Store.init();
