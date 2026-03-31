import { APP_CONFIG } from './config.js';

// Initialize Supabase client
const supabaseClient = supabase.createClient(APP_CONFIG.supabase.url, APP_CONFIG.supabase.key);

export const Store = {
    // Database initialization
    async init() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            await this.refreshCurrentUser(session.user.id);
        }
    },

    async refreshCurrentUser(userId) {
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (profile) {
            localStorage.setItem('currentUser', JSON.stringify(profile));
            return profile;
        }
        return null;
    },

    async login(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            this.showToast(error.message, 'error');
            return null;
        }
        return await this.refreshCurrentUser(data.user.id);
    },

    async logout() {
        await supabaseClient.auth.signOut();
        localStorage.removeItem('currentUser');
    },

    async loginWithCode(code) {
        const AUDITOR_EMAIL = 'auditoria@musarana.cloud';
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: AUDITOR_EMAIL,
            password: code
        });

        if (error) {
            this.showToast('Código de acceso incorrecto o caducado', 'error');
            return null;
        }

        const profile = await this.refreshCurrentUser(data.user.id);
        if (profile) {
            await this.logAuditAccess(profile.full_name);
        }
        return profile;
    },

    async updateAuditCode(newCode) {
        this.showToast('Actualización manual en el panel de Supabase Auth (auditoria@musarana.cloud)', 'info');
        return true;
    },

    getUser() {
        const data = localStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    },

    async updateProfile(userId, newName, newPassword) {
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .update({ full_name: newName })
            .eq('id', userId);

        if (profileError) return false;

        if (newPassword) {
            const { error: authError } = await supabaseClient.auth.updateUser({
                password: newPassword
            });
            if (authError) return false;
        }

        await this.refreshCurrentUser(userId);
        return true;
    },

    async adminGetAllUsers() {
        const { data } = await supabaseClient.from('profiles').select('*');
        return data || [];
    },

    async adminSaveUser(userData) {
        if (userData.id) {
            const { error } = await supabaseClient
                .from('profiles')
                .update({ full_name: userData.name, role: userData.role })
                .eq('id', userData.id);
            return error ? { success: false, error: error.message } : { success: true };
        } else {
            const { data, error } = await supabaseClient.auth.signUp({
                email: userData.username,
                password: userData.password,
                options: { data: { full_name: userData.name, role: userData.role } }
            });

            if (error) return { success: false, error: error.message };
            
            await supabaseClient.from('profiles').upsert({
                id: data.user.id,
                full_name: userData.name,
                role: userData.role
            });

            return { success: true };
        }
    },

    async adminDeleteUser(userId) {
        const { error } = await supabaseClient.from('profiles').delete().eq('id', userId);
        return error ? { success: false, error: error.message } : { success: true };
    },

    getAvailableMonths(records) {
        const months = new Set();
        records.forEach(r => {
            const date = new Date(r.timestamp);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            months.add(`${yyyy}-${mm}`);
        });
        const now = new Date();
        months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
        return Array.from(months).sort((a,b) => b.localeCompare(a));
    },

    formatMonthLabel(yymm) {
        const [year, month] = yymm.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
    },

    async calculateMonthlyHours(userId, monthString = null) {
        let year, month;
        if (monthString) {
            const parts = monthString.split('-');
            year = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
        } else {
            const now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
        }

        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

        const { data: monthRecords } = await supabaseClient
            .from('time_records')
            .select('*')
            .eq('user_id', userId)
            .gte('timestamp', startDate)
            .lte('timestamp', endDate)
            .order('timestamp', { ascending: true });

        // FIX: Find if there's a preceding 'IN' before this month
        const { data: precedingRecord } = await supabaseClient
            .from('time_records')
            .select('*')
            .eq('user_id', userId)
            .lt('timestamp', startDate)
            .order('timestamp', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        let allRecords = monthRecords || [];
        if (precedingRecord && precedingRecord.type === 'IN') {
            allRecords = [precedingRecord, ...allRecords];
        }

        if (allRecords.length === 0) return 0;

        let totalMs = 0;
        let lastIn = null;

        for (const r of allRecords) {
            if (r.type === 'IN') {
                lastIn = new Date(r.timestamp);
            } else if (r.type === 'OUT' && lastIn) {
                totalMs += (new Date(r.timestamp) - lastIn);
                lastIn = null;
            }
        }
        return totalMs;
    },

    formatTime(ms) {
        if (!ms) return '0h 0m';
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    },

    async getRecords(filters = {}) {
        let query = supabaseClient.from('time_records').select('*');
        if (filters.userId && filters.userId !== 'ALL') query = query.eq('user_id', filters.userId);
        if (filters.month) {
            const [year, month] = filters.month.split('-');
            const startDate = new Date(year, month - 1, 1).toISOString();
            const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
            query = query.gte('timestamp', startDate).lte('timestamp', endDate);
        }
        const { data } = await query.order('timestamp', { ascending: false });
        return data || [];
    },

    async clockAction(userId, type, notes = '') {
        const user = this.getUser();
        const { data } = await supabaseClient
            .from('time_records')
            .insert({
                user_id: userId,
                user_name: user.full_name,
                type,
                timestamp: new Date().toISOString(), // Usar hora cliente para sincronizar cronómetro
                notes: notes.trim()
            })
            .select()
            .single();
        return data;
    },

    async adminUpdateRecord(recordId, newData) {
        const { error } = await supabaseClient
            .from('time_records')
            .update({
                timestamp: newData.timestamp,
                type: newData.type,
                notes: (newData.notes || '').trim()
            })
            .eq('id', recordId);
        return !error;
    },

    async adminAddRecord(userId, userName, timestamp, type, notes) {
        const { error } = await supabaseClient
            .from('time_records')
            .insert({
                user_id: userId,
                user_name: userName,
                timestamp: timestamp,
                type: type,
                notes: (notes || '').trim()
            });
        return !error;
    },

    async getEmployeeStatus(userId) {
        const { data } = await supabaseClient
            .from('time_records')
            .select('type')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();
        return data ? data.type : 'OUT';
    },

    async getLastClockIn(userId) {
        const { data } = await supabaseClient
            .from('time_records')
            .select('timestamp')
            .eq('user_id', userId)
            .eq('type', 'IN')
            .order('timestamp', { ascending: false })
            .limit(1)
            .single();
        return data;
    },

    async validateMonth(userId, monthYear) {
        const [year, month] = monthYear.split('-');
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
        const { error } = await supabaseClient
            .from('time_records')
            .update({ is_validated: true, validation_date: new Date().toISOString() })
            .eq('user_id', userId)
            .gte('timestamp', startDate)
            .lte('timestamp', endDate);
        return !error;
    },

    async companyValidateMonth(userId, monthYear) {
        const [year, month] = monthYear.split('-');
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
        const { error } = await supabaseClient
            .from('time_records')
            .update({ is_company_validated: true, company_validation_date: new Date().toISOString() })
            .eq('user_id', userId)
            .gte('timestamp', startDate)
            .lte('timestamp', endDate);
        return !error;
    },

    async getDashboardStats() {
        const profiles = await this.adminGetAllUsers();
        const employees = profiles.filter(p => p.role === 'employee');
        const today = new Date().toISOString().split('T')[0];
        const { data: todayRecords } = await supabaseClient
            .from('time_records')
            .select('id')
            .gte('timestamp', `${today}T00:00:00Z`)
            .lte('timestamp', `${today}T23:59:59Z`);

        let activeCount = 0;
        for (const emp of employees) {
            const status = await this.getEmployeeStatus(emp.id);
            if (status === 'IN') activeCount++;
        }
        return { todayRecords: todayRecords ? todayRecords.length : 0, activeCount };
    },

    async logAuditAccess(auditorName) {
        try {
            await supabaseClient.from('audit_logs').insert({
                auditor_name: auditorName,
                access_type: 'LOGIN_PORTAL',
                user_agent: navigator.userAgent
            });
        } catch (e) {
            console.warn('Audit table Error:', e);
        }
    },

    async getAuditLogs() {
        const { data } = await supabaseClient
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false });
        return data || [];
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()" style="margin-left:1rem;background:none;border:none;color:inherit;cursor:pointer;">&times;</button>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    async exportEmployeeCSV(empId, monthId) {
        const records = await this.getRecords({ userId: empId, month: monthId === 'ALL' ? null : monthId });
        const users = await this.adminGetAllUsers();
        let filename = `auditoria_${APP_CONFIG.name}_${monthId}.csv`;
        if (records.length === 0) {
            this.showToast('No hay registros para exportar', 'error');
            return;
        }

        const headers = ["ID Registro", "Empleado", "Timestamp", "Tipo", "Notas", "Firma Empleado", "Firma Empresa"];
        const csvRows = [headers.join(',')];
        records.forEach(r => {
            csvRows.push([r.id, `"${r.user_name}"`, r.timestamp, r.type, `"${r.notes || ''}"`, r.is_validated ? 'SI' : 'NO', r.is_company_validated ? 'SI' : 'NO'].join(','));
        });

        if (empId !== 'ALL') {
            const hours = await this.calculateMonthlyHours(empId, monthId === 'ALL' ? null : monthId);
            const firstRec = records[0] || {};
            csvRows.push('', '--- RESUMEN LEGAL DE AUDITORÍA ---');
            csvRows.push(`"TOTAL HORAS TRABAJADAS","${this.formatTime(hours)}"`);
            csvRows.push(`"Certificación Empleado","${firstRec.is_validated ? 'VALIDADO EL ' + new Date(firstRec.validation_date).toLocaleString() : 'PENDIENTE'}"`);
            csvRows.push(`"Certificación Empresa","${firstRec.is_company_validated ? 'VALIDADO EL ' + new Date(firstRec.company_validation_date).toLocaleString() : 'PENDIENTE'}"`);
            csvRows.push(`"Generado por","${this.getUser()?.full_name || 'Sistema'}"`);
            csvRows.push(`"Fecha de Reporte","${new Date().toLocaleString()}"`);
        }

        const blob = new Blob(["\ufeff" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        this.showToast('Reporte generado correctamente');
    }
};

Store.init();
