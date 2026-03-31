import { Store } from '../store.js';
import { APP_CONFIG } from '../config.js';

export const AuditorDashboard = {
    render() {
        const user = Store.getUser();
        if (!user) return '';
        return `
            <div style="width: 100%;">
                <nav class="navbar" style="background: rgba(239, 68, 68, 0.05);">
                    <div class="nav-brand"><img src="${APP_CONFIG.logo}" alt="${APP_CONFIG.name}" style="height: 48px;"> <span style="font-size: 0.9rem; margin-left:1rem; color:var(--danger); font-weight:700;">ACCESO AUDITORÍA</span></div>
                    <div class="user-info">
                        <a href="#/manual" class="btn btn-secondary" style="margin-right: 1rem; background: #FEF2F2; color: #DC2626; border: none; font-size: 0.85rem;">📖 Manual</a>
                        <span class="user-role" style="background: #FEE2E2; color: #991B1B;">Auditoría</span>
                        <span style="font-weight: 500;">${user.full_name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container mt-6">
                    <div class="glass-panel" style="padding: 2.5rem;">
                        <h3 style="margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1.5rem;">🛡️ Historial de Accesos de Inspección</h3>
                        <div class="table-container" style="background: white;">
                            <table class="table" id="audit-logs-table" style="margin-bottom: 2rem;">
                                <thead>
                                    <tr><th>Fecha y Hora</th><th>Inspector</th><th>Acción</th><th>Dispositivo/Navegador</th></tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                        <div style="margin: 3rem 0; border-top: 2px dashed #E5E7EB; padding-top: 2rem;">
                            <h3>🔍 Búsqueda de Registros Laborales</h3>
                        </div>
                        <div class="dashboard-grid" style="align-items: end; margin-bottom: 2rem; background: #f8fafc; padding: 1.5rem; border-radius: 1rem;">
                            <div class="form-group"><label class="form-label">Empleado</label><select id="export-filter-employee" class="form-control"></select></div>
                            <div class="form-group"><label class="form-label">Mes</label><select id="export-filter-month" class="form-control"></select></div>
                            <button class="btn btn-primary" id="btn-export" style="height: 42px;">Generar Reporte Firma</button>
                        </div>
                        <div class="table-container" style="background: white;">
                            <table class="table" id="audit-records">
                                <thead>
                                    <tr><th>ID Registro</th><th>Empleado</th><th>Fecha/Hora (ISO)</th><th>Acción</th><th>Firma Empleado</th><th>Firma Empresa</th></tr>
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
        const tbodyLogs = document.querySelector('#audit-logs-table tbody');
        const tbodyRecords = document.querySelector('#audit-records tbody');
        const selectEmployee = document.getElementById('export-filter-employee');
        const selectMonth = document.getElementById('export-filter-month');

        const renderAuditLogs = async () => {
            const logs = await Store.getAuditLogs();
            tbodyLogs.innerHTML = logs.map(l => `<tr><td style="font-family:monospace;">${new Date(l.created_at).toLocaleString()}</td><td style="font-weight:500;">${l.auditor_name}</td><td><span class="badge badge-active">ACCESO PORTAL</span></td><td style="font-size: 0.75rem;">${l.user_agent}</td></tr>`).join('');
        };

        const renderRecordsTable = async () => {
            const empId = selectEmployee.value;
            const month = selectMonth.value;
            const records = await Store.getRecords({ userId: empId, month: month === 'ALL' ? null : month });
            tbodyRecords.innerHTML = records.map(r => `<tr><td style="font-size:0.7rem;">${r.id.split('-')[0]}...</td><td>${r.user_name}</td><td style="font-family:monospace;">${new Date(r.timestamp).toLocaleString()}</td><td><span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type}</span></td><td>${r.is_validated ? '✔ SI' : '⌛ PENDIENTE'}</td><td>${r.is_company_validated ? '✔ SI' : '⌛ PENDIENTE'}</td></tr>`).join('');
        };

        const records = await Store.getRecords();
        const availableMonths = Store.getAvailableMonths(records);
        const employees = (await Store.adminGetAllUsers()).filter(u => u.role === 'employee');

        selectEmployee.innerHTML = '<option value="ALL">Todos los Empleados registrados</option>' + employees.map(emp => `<option value="${emp.id}">${emp.full_name}</option>`).join('');
        selectMonth.innerHTML = availableMonths.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
        
        selectEmployee.addEventListener('change', renderRecordsTable);
        selectMonth.addEventListener('change', renderRecordsTable);
        document.getElementById('btn-export').addEventListener('click', async () => await Store.exportEmployeeCSV(selectEmployee.value, selectMonth.value));

        renderAuditLogs();
        renderRecordsTable();
    }
};
