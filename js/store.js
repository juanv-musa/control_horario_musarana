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
        
        let filename = `auditoria_MUSARANA`;
        if (empId !== 'ALL') {
            const empName = users.find(u => u.id === empId)?.full_name.replace(/\s+/g, '_') || empId;
            filename += `_${empName}`;
        }
        filename += `_${monthId}.csv`;

        if (records.length === 0) {
            this.showToast('No hay registros para exportar', 'error');
            return;
        }

        const headers = ["UUID", "Empleado", "Marca de Tiempo", "Tipo", "Observaciones", "Firma Empleado", "Firma Empresa"];
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

        if (empId !== 'ALL' && monthId !== 'ALL') {
            const hours = await this.calculateMonthlyHours(empId, monthId);
            csvRows.push('');
            csvRows.push(`"TOTAL HORAS","${this.formatTime(hours)}"`);
            csvRows.push(`"Certificación Empleado","${records[0].is_validated ? 'VALIDADO POR EMPLEADO ('+new Date(records[0].validation_date).toLocaleDateString()+')' : 'PENDIENTE'}"`);
            csvRows.push(`"Certificación Empresa","${records[0].is_company_validated ? 'VALIDADO POR EMPRESA ('+new Date(records[0].company_validation_date).toLocaleDateString()+')' : 'PENDIENTE'}"`);
        }

        const blob = new Blob(["\ufeff" + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
    }
};

Store.init();
