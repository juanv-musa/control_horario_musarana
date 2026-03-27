const DEFAULT_USERS = [
    { id: 1, username: 'empleado', password: '123', role: 'employee', name: 'Juan C. (Empleado)' },
    { id: 2, username: 'jefe', password: '123', role: 'employer', name: 'Laura Gómez (Gerente)' },
    { id: 3, username: 'inspector', password: '123', role: 'auditor', name: 'Inspectoría Estatal' }
];

export const Store = {
    // Database initialization
    init() {
        if (!localStorage.getItem('timeRecords')) {
            localStorage.setItem('timeRecords', JSON.stringify([]));
        }
        if (!localStorage.getItem('usersDB')) {
            localStorage.setItem('usersDB', JSON.stringify(DEFAULT_USERS));
        }
    },

    // Auth methods
    login(username, password) {
        const users = JSON.parse(localStorage.getItem('usersDB'));
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const safeUser = { ...user };
            delete safeUser.password;
            localStorage.setItem('currentUser', JSON.stringify(safeUser));
            return safeUser;
        }
        return null;
    },

    logout() {
        localStorage.removeItem('currentUser');
    },

    getUser() {
        const data = localStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    },

    // User Profile
    updateProfile(userId, newName, newPassword) {
        const users = JSON.parse(localStorage.getItem('usersDB'));
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            if (newName) users[userIndex].name = newName;
            if (newPassword) users[userIndex].password = newPassword;
            localStorage.setItem('usersDB', JSON.stringify(users));
            
            // Update current user session info
            const current = this.getUser();
            if (current && current.id === userId) {
                current.name = users[userIndex].name;
                localStorage.setItem('currentUser', JSON.stringify(current));
            }
            return true;
        }
        return false;
    },

    // Admin User CRUD Methods
    adminGetAllUsers() {
        return JSON.parse(localStorage.getItem('usersDB')) || [];
    },

    adminSaveUser(userData) {
        let users = this.adminGetAllUsers();
        if (userData.id) {
            // Update
            const index = users.findIndex(u => u.id === parseInt(userData.id));
            if (index !== -1) {
                const oldPass = users[index].password;
                users[index] = { ...users[index], ...userData, id: parseInt(userData.id) };
                if (!userData.password) users[index].password = oldPass;
            }
        } else {
            // Create
            if (users.find(u => u.username === userData.username)) {
                return { success: false, error: 'El usuario ya existe' };
            }
            users.push({ ...userData, id: Date.now() });
        }
        localStorage.setItem('usersDB', JSON.stringify(users));
        return { success: true };
    },

    adminDeleteUser(userId) {
        let users = this.adminGetAllUsers();
        const me = this.getUser();
        if (userId === me.id) return { success: false, error: 'No puedes borrarte a ti mismo' };
        
        users = users.filter(u => u.id !== parseInt(userId));
        localStorage.setItem('usersDB', JSON.stringify(users));
        return { success: true };
    },

    // Time Tracking Methods
    getAvailableMonths() {
        const records = this.getRecords();
        const months = new Set();
        records.forEach(r => {
            const date = new Date(r.timestamp);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            months.add(`${yyyy}-${mm}`);
        });
        
        // Always ensure current month exists
        const now = new Date();
        const currentYYMM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        months.add(currentYYMM);
        
        // Sort descending (newest first)
        return Array.from(months).sort((a,b) => b.localeCompare(a));
    },

    formatMonthLabel(yymm) {
        const [year, month] = yymm.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
    },

    calculateMonthlyHours(userId, monthString = null) {
        let year, month;
        if (monthString) {
            [year, month] = monthString.split('-');
            year = parseInt(year);
            month = parseInt(month) - 1; // 0-indexed month
        } else {
            const now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
        }

        const monthRecords = this.getRecords()
            .filter(r => {
                const rDate = new Date(r.timestamp);
                return r.userId == userId && rDate.getMonth() === month && rDate.getFullYear() === year;
            })
            .sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));

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
        
        // Return accumulated milliseconds (ignores currently open shift until OUT is registered)
        return totalMs;
    },

    formatTime(ms) {
        if (!ms) return '0h 0m';
        const totalMinutes = Math.floor(ms / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    },

    getRecords() {
        return JSON.parse(localStorage.getItem('timeRecords')) || [];
    },

    saveRecord(record) {
        const records = this.getRecords();
        records.push({ ...record, id: Date.now() });
        localStorage.setItem('timeRecords', JSON.stringify(records));
        return records;
    },

    // A worker clocking in/out
    clockAction(userId, type, notes = '') {
        // type: 'IN' or 'OUT'
        const users = JSON.parse(localStorage.getItem('usersDB'));
        const user = users.find(u => u.id === userId);
        const record = {
            userId,
            userName: user.name,
            type,
            timestamp: new Date().toISOString(),
            notes: notes.trim()
        };
        this.saveRecord(record);
        return record;
    },

    exportEmployeeCSV(empId, monthId) {
        let allRecords = this.getRecords().sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
        let currentRecords = allRecords;
        let filename = `auditoria_MUSARANA`;
        const employees = this.adminGetAllUsers();

        if (empId !== 'ALL') {
            currentRecords = currentRecords.filter(r => r.userId == empId);
            const empName = employees.find(e => e.id == empId)?.name.replace(/\s+/g, '_') || empId;
            filename += `_${empName}`;
        } else {
            filename += `_Global`;
        }

        if (monthId !== 'ALL') {
            const [year, month] = monthId.split('-');
            currentRecords = currentRecords.filter(r => {
                const d = new Date(r.timestamp);
                return d.getFullYear() === parseInt(year) && d.getMonth() === (parseInt(month) - 1);
            });
            filename += `_${monthId}`;
        } else {
            filename += `_HistoricoCompleto`;
        }

        filename += '.csv';

        if (currentRecords.length === 0) {
            this.showToast('No hay registros para exportar en el periodo seleccionado', 'error');
            return false;
        }

        this.showToast('Generando archivo de firmas...', 'info');

        const headers = ["UUID", "Empleado", "Marca de Tiempo (ISO)", "Tipo Acción", "Observaciones"];
        const csvRows = [headers.join(',')];
        
        currentRecords.forEach(r => {
            const hash = `${r.id.toString(16).toUpperCase()}-${r.userId}F`;
            const escapedName = `"${r.userName.replace(/"/g, '""')}"`;
            const typeES = r.type === 'IN' ? 'ENTRADA' : 'SALIDA';
            const safeNotes = r.notes ? `"${r.notes.replace(/"/g, '""')}"` : '""';
            csvRows.push([hash, escapedName, r.timestamp, typeES, safeNotes].join(','));
        });

        // APENDICE LEGAL: SUMATORIO Y FIRMAS
        if (empId !== 'ALL' && monthId !== 'ALL') {
            const totalFormatted = this.formatTime(this.calculateMonthlyHours(empId, monthId));
            csvRows.push(`,,,`);
            csvRows.push(`"TOTAL COMPUTADO (${this.formatMonthLabel(monthId).toUpperCase()})","","","${totalFormatted}"`);
            
            csvRows.push(`,,,`);
            csvRows.push(`"Firma de la Empresa:","_______________________","","Firma del Trabajador:","_______________________"`);
            csvRows.push(`"Sello o representante","","","Conforme",""`);
            csvRows.push(`"A día ___ de _________________ de 20___","","","",""`);
        }

        const csvString = "\ufeff" + csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        
        setTimeout(() => {
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            this.showToast(`Descargado: ${filename}`, 'success');
        }, 500);

        return true;
    },

    // Get current status for a specific employee
    getEmployeeStatus(userId) {
        const records = this.getRecords().filter(r => r.userId === userId);
        if (records.length === 0) return 'OUT';
        
        // Sort by newest first
        records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return records[0].type; // 'IN' or 'OUT'
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
    }
};

// Initialize on load
Store.init();
