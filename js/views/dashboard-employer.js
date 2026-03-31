import { Store } from '../store.js';
import { APP_CONFIG } from '../config.js';

export const EmployerDashboard = {
    render() {
        const user = Store.getUser();
        if (!user) return '';
        return `
            <div style="width: 100%;">
                <nav class="navbar">
                    <div class="nav-brand"><img src="${APP_CONFIG.logo}" alt="${APP_CONFIG.name}" style="height: 48px;"></div>
                    <div class="user-info">
                        <a href="#/manual" class="btn btn-secondary" style="margin-right: 1rem; background: #EEF2FF; color: #6366F1; border: none; font-size: 0.85rem;">📖 Manual</a>
                        <span class="user-role">${APP_CONFIG.name}</span>
                        <span style="font-weight: 500;">${user.full_name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container mt-6">
                    <div class="dashboard-grid mb-6">
                        <div class="stat-card" style="background: linear-gradient(135deg, #8CC63F 0%, #7EAD36 100%); color: white; border: none;">
                            <h4 style="opacity: 0.9; font-size: 0.85rem; text-transform: uppercase;">EMPLEADOS ACTIVOS</h4>
                            <div id="stat-active" style="font-size: 2.5rem; font-weight: 800; margin-top: 0.5rem;">...</div>
                        </div>
                        <div class="stat-card">
                            <h4 style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase;">REGISTROS HOY</h4>
                            <div id="stat-today" style="font-size: 2.5rem; font-weight: 800; margin-top: 0.5rem;">...</div>
                        </div>
                    </div>
                    <div class="glass-panel" style="padding: 2.5rem;">
                        <h2 style="margin-bottom: 2rem;">Gestión de Registro Horario</h2>
                        <select id="month-filter" class="form-control" style="width: auto; min-width: 200px; margin-bottom: 2rem;"></select>
                        <table class="table" id="records-table">
                            <thead><tr><th>Empleado</th><th>Fecha/Hora</th><th>Acción</th><th>Notas</th><th>Firma</th><th>Acción Empresa</th></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem; border-top: 1px solid var(--border); margin-top: 3rem;"><p>${APP_CONFIG.footer}</p></footer>
            </div>
        `;
    },
    async init() {
        const tbody = document.querySelector('#records-table tbody');
        const monthFilter = document.getElementById('month-filter');
        const stats = await Store.getDashboardStats();
        document.getElementById('stat-active').textContent = stats.activeCount;
        document.getElementById('stat-today').textContent = stats.todayRecords;

        const renderTable = async () => {
            const records = await Store.getRecords({ month: monthFilter.value });
            tbody.innerHTML = records.map(r => `
                <tr><td>${r.user_name}</td><td>${new Date(r.timestamp).toLocaleString()}</td><td><span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type}</span></td><td>${r.notes || '-'}</td><td>${r.is_validated ? '✔' : '⌛'}</td><td>${r.is_company_validated ? 'VALIDADO' : `<button onclick="validateRow('${r.user_id}', '${monthFilter.value}')">Validar</button>`}</td></tr>
            `).join('');
        };
        window.validateRow = async (uid, m) => { if (await Store.companyValidateMonth(uid, m)) renderTable(); };
        const recs = await Store.getRecords();
        monthFilter.innerHTML = Store.getAvailableMonths(recs).map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
        monthFilter.addEventListener('change', renderTable);
        renderTable();
    }
};
