import { Store } from '../store.js';
import { Router } from '../router.js';
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
                            <div id="stat-active" style="font-size: 2.5rem; font-weight: 800; margin-top: 0.5rem;">Cargando...</div>
                        </div>
                        <div class="stat-card">
                            <h4 style="color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase;">REGISTROS HOY</h4>
                            <div id="stat-today" style="font-size: 2.5rem; font-weight: 800; margin-top: 0.5rem; color: var(--text-primary);">Cargando...</div>
                        </div>
                    </div>
                    <div class="glass-panel" style="padding: 2.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem;">
                            <h2 style="margin: 0;">Gestión de Registro Horario</h2>
                            <div style="display: flex; gap: 1rem;">
                                <select id="month-filter" class="form-control" style="width: auto; min-width: 200px; padding: 0.5rem 1rem;"></select>
                            </div>
                        </div>
                        <div class="table-container" style="background: white;">
                            <table class="table" id="records-table">
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th>Fecha/Hora</th>
                                        <th>Acción</th>
                                        <th>Notas</th>
                                        <th>Estado Firma</th>
                                        <th>Validación Empresa</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem; border-top: 1px solid var(--border); margin-top: 3rem; background: white;">
                    <p>${APP_CONFIG.footer}</p>
                </footer>
            </div>
        `;
    },
    async init() {
        const tbody = document.querySelector('#records-table tbody');
        const monthFilter = document.getElementById('month-filter');
        const statActive = document.getElementById('stat-active');
        const statToday = document.getElementById('stat-today');

        const updateStats = async () => {
            const stats = await Store.getDashboardStats();
            statActive.textContent = stats.activeCount;
            statToday.textContent = stats.todayRecords;
        };

        const renderTable = async () => {
            const month = monthFilter.value;
            const records = await Store.getRecords({ month });
            tbody.innerHTML = records.map(r => `
                <tr>
                    <td>${r.user_name}</td>
                    <td style="font-family:monospace;">${new Date(r.timestamp).toLocaleString()}</td>
                    <td><span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type === 'IN' ? 'ENTRADA' : 'SALIDA'}</span></td>
                    <td style="font-size:0.85rem;">${r.notes || '-'}</td>
                    <td>${r.is_validated ? '✔ SI' : '⌛ PENDIENTE'}</td>
                    <td>
                        ${r.is_company_validated 
                            ? '<span style="color:#6366F1;">✔ VALIDADO</span>' 
                            : `<button class="btn btn-secondary btn-sm" onclick="validateRow('${r.user_id}', '${month}')">Validar Mes</button>`}
                    </td>
                </tr>
            `).join('');
        };

        window.validateRow = async (uid, month) => {
            const res = await Store.companyValidateMonth(uid, month);
            if (res) { Store.showToast('Mes validado correctamente'); renderTable(); }
        };

        const records = await Store.getRecords();
        const availableMonths = Store.getAvailableMonths(records);
        monthFilter.innerHTML = availableMonths.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
        monthFilter.addEventListener('change', renderTable);

        updateStats();
        renderTable();
    }
};
