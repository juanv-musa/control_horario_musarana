import { Store } from '../store.js';
import { APP_CONFIG } from '../config.js';

export const AuditorDashboard = {
    render() {
        const user = Store.getUser();
        if (!user) return '';
        return `
            <div style="width: 100%;">
                <nav class="navbar" style="background: rgba(239, 68, 68, 0.05);">
                    <div class="nav-brand"><img src="${APP_CONFIG.logo}" alt="${APP_CONFIG.name}" style="height: 48px;"> <span style="font-size: 0.9rem; margin-left:1rem; color:var(--danger); font-weight:700;">AUDITORÍA</span></div>
                    <div class="user-info">
                        <a href="#/manual" class="btn btn-secondary" style="margin-right: 1rem; background: #FEF2F2; color: #DC2626; border: none; font-size: 0.85rem;">📖 Manual</a>
                        <span style="font-weight: 500;">${user.full_name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container mt-6">
                    <div class="glass-panel" style="padding: 2.5rem;">
                        <h3 style="margin-bottom: 2rem;">🛡️ Accesos de Inspección</h3>
                        <table class="table" id="audit-logs-table">
                            <thead><tr><th>Fecha/Hora</th><th>Inspector</th><th>Acción</th><th>Navegador</th></tr></thead>
                            <tbody></tbody>
                        </table>
                        <div style="margin: 3rem 0; border-top: 2px dashed #E5E7EB; padding-top: 2rem;"><h3>🔍 Búsqueda de Registros</h3></div>
                        <div class="dashboard-grid" style="align-items: end; background: #f8fafc; padding: 1.5rem; border-radius: 1rem; margin-bottom: 2rem;">
                            <div class="form-group"><label class="form-label">Empleado</label><select id="export-filter-employee" class="form-control"></select></div>
                            <div class="form-group"><label class="form-label">Mes</label><select id="export-filter-month" class="form-control"></select></div>
                            <button class="btn btn-primary" id="btn-export" style="height: 42px;">Generar Reporte Firma</button>
                        </div>
                        <table class="table" id="audit-records">
                            <thead><tr><th>ID</th><th>Empleado</th><th>Fecha/Hora</th><th>Tipo</th><th>Firma</th></tr></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem;"><p>${APP_CONFIG.footer}</p></footer>
            </div>
        `;
    },
    async init() {
        const tbodyLogs = document.querySelector('#audit-logs-table tbody');
        const tbodyRecords = document.querySelector('#audit-records tbody');
        const logs = await Store.getAuditLogs();
        tbodyLogs.innerHTML = logs.map(l => `<tr><td>${new Date(l.created_at).toLocaleString()}</td><td>${l.auditor_name}</td><td><span class="badge badge-active">LOGIN</span></td><td style="font-size:0.7rem;">${l.user_agent}</td></tr>`).join('');
        
        const renderRecords = async () => {
            const records = await Store.getRecords({ userId: document.getElementById('export-filter-employee').value, month: document.getElementById('export-filter-month').value });
            tbodyRecords.innerHTML = records.map(r => `<tr><td>${r.id.split('-')[0]}...</td><td>${r.user_name}</td><td>${new Date(r.timestamp).toLocaleString()}</td><td><span class="badge">${r.type}</span></td><td>${r.is_validated ? '✔' : '⌛'}</td></tr>`).join('');
        };
        const emps = (await Store.adminGetAllUsers()).filter(u => u.role === 'employee');
        const recs = await Store.getRecords();
        document.getElementById('export-filter-employee').innerHTML = '<option value="ALL">TODOS</option>' + emps.map(e => `<option value="${e.id}">${e.full_name}</option>`).join('');
        document.getElementById('export-filter-month').innerHTML = Store.getAvailableMonths(recs).map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
        document.getElementById('btn-export').addEventListener('click', () => Store.exportEmployeeCSV(document.getElementById('export-filter-employee').value, document.getElementById('export-filter-month').value));
        renderRecords();
    }
};
