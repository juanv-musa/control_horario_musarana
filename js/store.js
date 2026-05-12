// Initialize Supabase client
const supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);

export const Store = {
    // Database initialization
    async init() {
        // No local init needed anymore, just check session
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

    // Auth methods
    async login(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            this.showToast(error.message, 'error');
            return null;
        }

        const profile = await this.refreshCurrentUser(data.user.id);
        return profile;
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
        // This is tricky because the Auditor is a different user. 
        // We'll use a special RPC or just updating the Auditor's record in auth.users 
        // if we are the admin. However, Supabase Client doesnt allow updating OTHER users' passwords easily.
        // For this demo/MVP, we'll suggest the admin to manually change it in Supabase Auth Dashboard,
        // or we'd need an Edge Function.
        this.showToast('El código se gestiona en el panel de Supabase (User: auditoria@musarana.cloud)', 'info');
        return true;
    },

    getUser() {
        const data = localStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    },

    // User Profile
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

    // Admin User CRUD Methods
    async adminGetAllUsers() {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*');
        return data || [];
    },

    async adminSaveUser(userData) {
        if (userData.id) {
            // Update profile
            const { error } = await supabaseClient
                .from('profiles')
                .update({
                    full_name: userData.name,
                    role: userData.role
                })
                .eq('id', userData.id);
            
            return error ? { success: false, error: error.message } : { success: true };
        } else {
            // Create user (Note: In a real app, this should be done via Edge Functions or Admin API)
            // For this demo, we'll use regular signUp. The user will need to confirm email if not disabled.
            const { data, error } = await supabaseClient.auth.signUp({
                email: userData.username,
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.name,
                        role: userData.role
                    }
                }
            });

            if (error) return { success: false, error: error.message };
            
            // Supabase trigger usually handles profile creation, but if not:
            await supabaseClient.from('profiles').upsert({
                id: data.user.id,
                full_name: userData.name,
                role: userData.role
            });

            return { success: true };
        }
    },

    async adminDeleteUser(userId) {
        // Deleting from Auth requires Admin API. We can "deactivate" in profiles.
        const { error } = await supabaseClient
            .from('profiles')
            .delete()
            .eq('id', userId);
        
        return error ? { success: false, error: error.message } : { success: true };
    },

    // Time Tracking Methods
    getAvailableMonths(records) {
        const months = new Set();
        records.forEach(r => {
            const date = new Date(r.timestamp);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            months.add(`${yyyy}-${mm}`);
        });
        
        const now = new Date();
        const currentYYMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        months.add(currentYYMM);
        
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
            [year, month] = monthString.split('-');
            year = parseInt(year);
            month = parseInt(month) - 1;
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

        if (!monthRecords) return 0;

        let totalMs = 0;
        let lastIn = null;

        for (const r of monthRecords) {
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

        const { data, error } = await query.order('timestamp', { ascending: false });
        return data || [];
    },

    async clockAction(userId, type, notes = '') {
        const user = this.getUser();
        const { data, error } = await supabaseClient
            .from('time_records')
            .insert({
                user_id: userId,
                user_name: user.full_name,
                type,
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

    async adminDeleteRecord(recordId) {
        const { error } = await supabaseClient
            .from('time_records')
            .delete()
            .eq('id', recordId);
        
        if (error) {
            console.error("Supabase Delete Error:", error);
            this.showToast("Error BD: " + error.message, 'error');
        }
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
            .update({ 
                is_validated: true, 
                validation_date: new Date().toISOString() 
            })
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
            .update({ 
                is_company_validated: true, 
                company_validation_date: new Date().toISOString() 
            })
            .eq('user_id', userId)
            .gte('timestamp', startDate)
            .lte('timestamp', endDate);
        
        return !error;
    },

    async getDashboardStats() {
        // Fetch all profiles to find employees
        const profiles = await this.adminGetAllUsers();
        const employees = profiles.filter(p => p.role === 'employee');

        // Fetch today's records
        const today = new Date().toISOString().split('T')[0];
        const { data: todayRecords } = await supabaseClient
            .from('time_records')
            .select('id')
            .gte('timestamp', `${today}T00:00:00Z`)
            .lte('timestamp', `${today}T23:59:59Z`);

        // Count active workers (last record is IN)
        let activeCount = 0;
        for (const emp of employees) {
            const status = await this.getEmployeeStatus(emp.id);
            if (status === 'IN') activeCount++;
        }

        return {
            todayRecords: todayRecords ? todayRecords.length : 0,
            activeCount
        };
    },

    // Audit Logging
    async logAuditAccess(auditorName) {
        try {
            await supabaseClient.from('audit_logs').insert({
                auditor_name: auditorName,
                access_type: 'LOGIN_PORTAL',
                user_agent: navigator.userAgent
            });
        } catch (e) {
            console.warn('Audit table may not exist yet:', e);
        }
    },

    async getAuditLogs() {
        const { data } = await supabaseClient
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false });
        return data || [];
    },

    // Notifications (Toast)
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button class="logout-btn" onclick="this.parentElement.remove()" style="margin-left: 1rem">&times;</button>
        `;
        
        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 3000);
    },

    async exportEmployeeCSV(empId, monthId) {
        const records = await this.getRecords({ userId: empId, month: monthId === 'ALL' ? null : monthId });
        const users = await this.adminGetAllUsers();
        
        let filename = `auditoria_MUSARAÑA`;
        if (empId !== 'ALL') {
            const empName = users.find(u => u.id === empId)?.full_name.replace(/\s+/g, '_') || empId;
            filename += `_${empName}`;
        }
        filename += `_${monthId}.csv`;

        if (records.length === 0) {
            this.showToast('No hay registros para exportar', 'error');
            return;
        }

        const headers = ["ID Registro", "Empleado", "Marca de Tiempo (ISO)", "Tipo", "Observaciones", "Firma Empleado", "Firma Empresa"];
        const csvRows = [headers.join(',')];
        
        records.forEach(r => {
            csvRows.push([
                r.id,
                `"${r.user_name}"`,
                r.timestamp,
                r.type,
                `"${r.notes || ''}"`,
                r.is_validated ? 'SI' : 'NO',
                r.is_company_validated ? 'SI' : 'NO'
            ].join(','));
        });

        // Add Legal Summary at the end for single-employee/month exports
        if (empId !== 'ALL') {
            const hours = await this.calculateMonthlyHours(empId, monthId === 'ALL' ? null : monthId);
            const firstRec = records[0] || {};
            
            csvRows.push('');
            csvRows.push('--- RESUMEN LEGAL DE AUDITORÍA ---');
            csvRows.push(`"TOTAL HORAS TRABAJADAS (PERIODO)","${this.formatTime(hours)}"`);
            
            const empCert = (firstRec && firstRec.is_validated)
                ? `VALIDADO POR EMPLEADO EL ${new Date(firstRec.validation_date).toLocaleString('es-ES')}`
                : 'PENDIENTE DE VALIDACIÓN POR EMPLEADO';
            csvRows.push(`"Certificación Empleado","${empCert}"`);
            
            const compCert = (firstRec && firstRec.is_company_validated)
                ? `VALIDADO POR EMPRESA EL ${new Date(firstRec.company_validation_date).toLocaleString('es-ES')}`
                : 'PENDIENTE DE REVISIÓN EMPRESARIAL';
            csvRows.push(`"Certificación Empresa","${compCert}"`);
            
            csvRows.push('');
            csvRows.push(`"Generado por","${this.getUser()?.full_name || 'Sistema'}"`);
            csvRows.push(`"Fecha de Reporte","${new Date().toLocaleString('es-ES')}"`);
        }

        const blob = new Blob(["\ufeff" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        this.showToast('Reporte generado correctamente');
    },

    // ─────────────────────────────────────────────────────────────────────────
    // PDF Export — Registro mensual de jornada
    // ─────────────────────────────────────────────────────────────────────────
    async exportEmployeePDF(empId, monthId) {
        const records = await this.getRecords({ userId: empId, month: monthId === 'ALL' ? null : monthId });
        const users = await this.adminGetAllUsers();
        const emp = users.find(u => u.id === empId);
        const empName = emp?.full_name || empId;

        if (records.length === 0) {
            this.showToast('No hay registros para exportar', 'error');
            return;
        }

        const hours = await this.calculateMonthlyHours(empId, monthId === 'ALL' ? null : monthId);
        const firstRec = records[0] || {};
        const monthLabel = monthId && monthId !== 'ALL' ? this.formatMonthLabel(monthId) : 'Todos los periodos';

        const empCert = (firstRec && firstRec.is_validated)
            ? `Validado el ${new Date(firstRec.validation_date).toLocaleDateString('es-ES')}`
            : 'Pendiente de firma por empleado';
        const compCert = (firstRec && firstRec.is_company_validated)
            ? `Validado el ${new Date(firstRec.company_validation_date).toLocaleDateString('es-ES')}`
            : 'Pendiente de revisión empresarial';

        const rowsHTML = records.map(r => {
            const d = new Date(r.timestamp);
            const badge = r.type === 'IN'
                ? `<span style="background:#D1FAE5;color:#065F46;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;">ENTRADA</span>`
                : `<span style="background:#FEE2E2;color:#991B1B;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;">SALIDA</span>`;
            return `<tr>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px;">${d.toLocaleString('es-ES')}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${badge}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${r.notes || '-'}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;">${r.is_validated ? '✅' : '⏳'}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:11px;">${r.is_company_validated ? '✅' : '⏳'}</td>
            </tr>`;
        }).join('');

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Registro Jornada — ${empName} — ${monthLabel}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Inter', sans-serif; color:#111827; background:#fff; padding:40px; font-size:12px; line-height:1.5; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px; border-bottom:2px solid #8CC63F; padding-bottom:20px; }
  .logo-area h1 { font-size:24px; font-weight:800; color:#8CC63F; letter-spacing:-0.02em; }
  .logo-area p { font-size:11px; color:#6b7280; font-weight:600; text-transform:uppercase; margin-top:4px; }
  .meta { text-align:right; }
  .meta .emp-name { font-size:18px; font-weight:800; color:#111827; }
  .meta .period { font-size:13px; color:#4b5563; margin-top:4px; font-weight:600; }
  .meta .generated { font-size:10px; color:#9ca3af; margin-top:6px; }
  .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:15px; margin:25px 0; }
  .summary-box { border:1px solid #e5e7eb; border-radius:10px; padding:15px; text-align:center; background:#f9fafb; }
  .summary-box .label { font-size:10px; text-transform:uppercase; color:#6b7280; font-weight:700; letter-spacing:.05em; margin-bottom:5px; }
  .summary-box .value { font-size:18px; font-weight:800; color:#111827; }
  table { width:100%; border-collapse:collapse; margin-top:20px; }
  thead th { background:#f3f4f6; padding:12px 10px; font-size:10px; text-transform:uppercase; color:#374151; font-weight:800; text-align:left; border-bottom:2px solid #d1d5db; }
  tbody td { padding:10px; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
  .cert-section { margin-top:40px; display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .cert-box { border:1px solid #e5e7eb; border-radius:10px; padding:18px; min-height:100px; background:#fff; }
  .cert-box .cert-title { font-size:10px; text-transform:uppercase; font-weight:800; color:#6b7280; margin-bottom:10px; border-bottom:1px solid #f3f4f6; padding-bottom:5px; }
  .cert-box .cert-value { font-size:12px; color:#111827; font-weight:500; }
  .legal-note { margin-top:40px; font-size:9.5px; color:#9ca3af; line-height:1.6; text-align:justify; border-top:1px solid #f3f4f6; padding-top:15px; }
  @media print { body { padding:20px; } .summary-box { background:#f9fafb !important; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo-area">
      <h1>MUSARAÑA</h1>
      <p>Control de Jornada Laboral</p>
      <div style="margin-top:8px; display:inline-block; background:#ECFDF5; color:#065F46; padding:4px 8px; border-radius:4px; font-size:9px; font-weight:800;">CONFORME ART. 34.9 ET</div>
    </div>
    <div class="meta">
      <div class="emp-name">${empName}</div>
      <div class="period">Periodo: ${monthLabel}</div>
      <div class="generated">Generado el ${new Date().toLocaleString('es-ES')}</div>
      <div class="generated">Responsable: ${this.getUser()?.full_name || 'Sistema'}</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-box">
      <div class="label">Total Fichajes</div>
      <div class="value">${records.length}</div>
    </div>
    <div class="summary-box">
      <div class="label">Horas Totales</div>
      <div class="value" style="color:#8CC63F;">${this.formatTime(hours)}</div>
    </div>
    <div class="summary-box">
      <div class="label">Estado de Firma</div>
      <div class="value" style="font-size:13px;">${firstRec.is_validated && firstRec.is_company_validated ? '✅ VALIDADO' : '⏳ EN PROCESO'}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30%;">Fecha y Hora</th>
        <th style="width:15%;">Evento</th>
        <th style="width:35%;">Observaciones</th>
        <th style="width:10%; text-align:center;">Emp.</th>
        <th style="width:10%; text-align:center;">Cía.</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
  </table>

  <div class="cert-section">
    <div class="cert-box">
      <div class="cert-title">Firma del Trabajador</div>
      <div class="cert-value">${empCert}</div>
      <div style="margin-top:20px; border-bottom:1px solid #e5e7eb; width:150px; height:40px;"></div>
    </div>
    <div class="cert-box">
      <div class="cert-title">Sello y Firma de la Empresa</div>
      <div class="cert-value">${compCert}</div>
      <div style="margin-top:20px; border-bottom:1px solid #e5e7eb; width:150px; height:40px;"></div>
    </div>
  </div>

  <div class="legal-note">
    Este documento constituye el registro diario de jornada previsto en el artículo 34.9 del Estatuto de los Trabajadores. 
    La empresa garantiza la veracidad de los datos aquí reflejados. El trabajador, mediante su validación digital o firma, 
    ratifica la exactitud de los periodos de trabajo informados. La empresa debe conservar estos registros durante cuatro 
    años, permaneciendo a disposición de las personas trabajadoras, de sus representantes legales y de la Inspección de 
    Trabajo y Seguridad Social.
  </div>
</body>
</html>`;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        setTimeout(() => { win.print(); }, 500);

        this.showToast('PDF generado — usa Imprimir → Guardar como PDF', 'success');
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Vacaciones y Ausencias
    // ─────────────────────────────────────────────────────────────────────────

    // Tipos de ausencia permitidos
    ABSENCE_TYPES: {
        vacation: '🏖️ Vacaciones',
        sick_leave: '🤒 Baja Médica',
        personal: '🧾 Asunto Personal',
        other: '📋 Otro'
    },

    ABSENCE_STATUSES: {
        pending: { label: 'Pendiente', color: '#F59E0B', bg: '#FEF3C7' },
        approved: { label: 'Aprobada', color: '#059669', bg: '#D1FAE5' },
        denied: { label: 'Denegada', color: '#DC2626', bg: '#FEE2E2' }
    },

    async getAbsences(filters = {}) {
        let query = supabaseClient
            .from('absences')
            .select('*, profiles(full_name)')
            .order('start_date', { ascending: false });

        if (filters.userId && filters.userId !== 'ALL') {
            query = query.eq('user_id', filters.userId);
        }
        if (filters.status && filters.status !== 'ALL') {
            query = query.eq('status', filters.status);
        }
        if (filters.year) {
            query = query.gte('start_date', `${filters.year}-01-01`)
                         .lte('start_date', `${filters.year}-12-31`);
        }

        const { data, error } = await query;
        if (error) console.error('getAbsences error:', error);
        return data || [];
    },

    async saveAbsence(absenceData) {
        const days = this.calcWorkingDays(absenceData.start_date, absenceData.end_date);
        const payload = {
            user_id: absenceData.user_id,
            type: absenceData.type,
            start_date: absenceData.start_date,
            end_date: absenceData.end_date,
            working_days: days,
            notes: (absenceData.notes || '').trim(),
            status: absenceData.status || 'pending',
            requested_by_employee: absenceData.requested_by_employee || false
        };

        if (absenceData.id) {
            const { error } = await supabaseClient.from('absences').update(payload).eq('id', absenceData.id);
            return !error;
        } else {
            const { error } = await supabaseClient.from('absences').insert(payload);
            return !error;
        }
    },

    async updateAbsenceStatus(absenceId, status) {
        const { error } = await supabaseClient
            .from('absences')
            .update({ status, reviewed_at: new Date().toISOString() })
            .eq('id', absenceId);
        return !error;
    },

    async deleteAbsence(absenceId) {
        const { error } = await supabaseClient.from('absences').delete().eq('id', absenceId);
        return !error;
    },

    // Calculate working days between two dates (Mon–Fri, no Spanish bank holidays)
    calcWorkingDays(startStr, endStr) {
        const start = new Date(startStr + 'T00:00:00');
        const end = new Date(endStr + 'T00:00:00');
        let count = 0;
        const cur = new Date(start);
        while (cur <= end) {
            const day = cur.getDay();
            if (day !== 0 && day !== 6) count++;
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    },

    // ─── Vacation Allowances ──────────────────────────────────────────────────
    DEFAULT_VACATION_DAYS: 22,

    async getVacationAllowances() {
        const { data, error } = await supabaseClient
            .from('vacation_allowances')
            .select('*');
        if (error) console.error('getVacationAllowances error:', error);
        return data || [];
    },

    async getOrCreateAllowance(userId) {
        const { data } = await supabaseClient
            .from('vacation_allowances')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (data) return data;

        // Create default
        const { data: newRow } = await supabaseClient
            .from('vacation_allowances')
            .insert({ user_id: userId, total_days: this.DEFAULT_VACATION_DAYS })
            .select()
            .single();
        return newRow;
    },

    async updateAllowance(userId, totalDays) {
        // Upsert
        const { error } = await supabaseClient
            .from('vacation_allowances')
            .upsert({ user_id: userId, total_days: totalDays }, { onConflict: 'user_id' });
        return !error;
    },

    async getUsedVacationDays(userId, year) {
        const absences = await this.getAbsences({
            userId,
            status: 'approved',
            year: year || new Date().getFullYear()
        });
        // Only count vacation type
        return absences
            .filter(a => a.type === 'vacation')
            .reduce((sum, a) => sum + (a.working_days || 0), 0);
    }
};

Store.init();
