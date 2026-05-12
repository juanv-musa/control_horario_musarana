import { Store } from '../store.js';

export const AuditorDashboard = {
    render() {
        const user = Store.getUser();
        if (!user) return '';

        return `
            <div style="width: 100%; min-height: 100vh; background: var(--bg-page);">
                <nav class="navbar" style="background: rgba(239, 68, 68, 0.05); border-bottom: 2px solid var(--danger);">
                    <div class="nav-brand" style="flex-wrap: wrap; gap: 0.5rem;">
                        <img src="assets/logo.png" alt="MUSARAÑA" style="height: 48px;"> 
                        <span style="font-size: 0.8rem; color: var(--danger); font-weight: 800; border-left: 2px solid var(--danger); padding-left: 0.75rem; text-transform: uppercase;">Acceso Inspección</span>
                    </div>
                    <div class="user-info">
                        <a href="#/manual" class="btn btn-secondary" style="background: #FEF2F2; color: #DC2626; border: none; font-size: 0.85rem; padding: 0.5rem 1rem;">📖 Manual</a>
                        <span class="user-role" style="background: #FEE2E2; color: #991B1B;">Auditor</span>
                        <span style="font-weight: 600;">${user.full_name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container py-4">
                    <div class="glass-panel" style="padding: 1.25rem;">
                        <div style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
                            <h2 style="margin: 0; font-size: 1.3rem;">📋 Auditoría Laboral</h2>
                            <p class="text-secondary" style="margin: 0.25rem 0 0 0; font-size: 0.9rem;">Registros oficiales conforme al Art. 34.9 ET.</p>
                        </div>
                        
                        <div class="dashboard-grid" style="margin-bottom: 1.5rem; background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label" style="font-size: 0.8rem;">Filtrar Empleado</label>
                                <select id="export-filter-employee" class="form-control" style="background: white; font-size: 0.9rem;">
                                    <option value="ALL">Todos los Empleados</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label" style="font-size: 0.8rem;">Periodo Mensual</label>
                                <select id="export-filter-month" class="form-control" style="background: white; font-size: 0.9rem;">
                                    <option value="ALL">Historial completo</option>
                                </select>
                            </div>
                            <button class="btn btn-primary" id="btn-export" style="height: 42px; width: 100%; background: var(--danger); border: none;">Generar Reporte CSV</button>
                        </div>
                        
                        <div id="audit-summary-container" style="display: none; background: #DBEAFE; color: #1E40AF; padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 2rem; border: 1px solid #BFDBFE;">
                            <div style="font-size: 0.85rem; opacity: 0.8; margin-bottom: 0.25rem;">CÓMPUTO TOTAL DEL PERIODO</div>
                            <span id="audit-monthly-hours" style="font-weight: 800; font-size: 1.5rem;">0h 0m</span>
                        </div>

                        <div class="table-container" style="background: white;">
                            <div style="margin: 0 0 1.5rem 0; border-top: 2px dashed #E5E7EB; padding-top: 2rem;">
                                <h3 style="margin-bottom: 1rem;">🔍 Búsqueda de Registros Laborales</h3>
                            </div>

                            <table class="table" id="audit-records">
                                <thead>
                                    <tr>
                                        <th>ID Registro</th>
                                        <th>Empleado</th>
                                        <th>Fecha/Hora (ISO)</th>
                                        <th>Acción</th>
                                        <th>Firma Empleado</th>
                                        <th>Firma Empresa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Filled dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <footer>
                    <p>Musaraña &copy; 2026</p>
                </footer>
            </div>
        `;
    },

    async init() {
        const tbody = document.querySelector('#audit-records tbody');
        if (!tbody) return;

        // Fetch initialization data
        const allRecords = await Store.getRecords();
        const employees = (await Store.adminGetAllUsers()).filter(u => u.role === 'employee');
        const availableMonths = Store.getAvailableMonths(allRecords);

        // Populate filter dropdowns
        const selectEmployee = document.getElementById('export-filter-employee');
        const selectMonth = document.getElementById('export-filter-month');
        
        if (selectEmployee) {
            selectEmployee.innerHTML = '<option value="ALL">Todos los Empleados registrados</option>';
            employees.forEach(emp => {
                const opt = document.createElement('option');
                opt.value = emp.id;
                opt.textContent = emp.full_name;
                selectEmployee.appendChild(opt);
            });
        }

        if (selectMonth && availableMonths.length > 0) {
            selectMonth.innerHTML = availableMonths.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
            selectMonth.value = availableMonths[0];
        }

        const applyFilters = async () => {
            const empId = selectEmployee ? selectEmployee.value : 'ALL';
            const monthId = selectMonth ? selectMonth.value : 'ALL';
            
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Consultando nube...</td></tr>';
            
            const filteredRecords = await Store.getRecords({ 
                userId: empId, 
                month: monthId === 'ALL' ? null : monthId 
            });

            if (filteredRecords.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-secondary">No hay registros para los criterios seleccionados.</td></tr>';
            } else {
                tbody.innerHTML = filteredRecords.map(r => {
                    const rDate = new Date(r.timestamp);
                    return `
                    <tr>
                        <td data-label="ID" style="font-size: 0.7rem; font-family: monospace; color: var(--text-secondary);">${r.id.split('-')[0]}...</td>
                        <td data-label="Empleado" style="font-weight: 600;">${r.user_name}</td>
                        <td data-label="Fecha/Hora" style="font-family: monospace;">${rDate.toLocaleString('es-ES')}</td>
                        <td data-label="Acción"><span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type === 'IN' ? 'ENTRADA' : 'SALIDA'}</span></td>
                        <td data-label="Firma Emp.">
                            ${r.is_validated 
                                ? `<span style="color: #10B981; font-weight: 600; font-size: 0.75rem;">✔ Validado</span>` 
                                : '<span style="color: #EF4444; font-weight: 600; font-size: 0.75rem;">⌛ Pendiente</span>'}
                        </td>
                        <td data-label="Firma Cía.">
                            ${r.is_company_validated 
                                ? `<span style="color: #6366F1; font-weight: 600; font-size: 0.75rem;">✔ Validado</span>` 
                                : '<span style="color: #EF4444; font-weight: 600; font-size: 0.75rem;">⌛ Pendiente</span>'}
                        </td>
                    </tr>
                `}).join('');
            }

            const summaryContainer = document.getElementById('audit-summary-container');
            const summaryText = document.getElementById('audit-monthly-hours');

            if (empId !== 'ALL' && monthId !== 'ALL') {
                if (summaryContainer && summaryText) {
                    const hours = await Store.calculateMonthlyHours(empId, monthId);
                    summaryText.textContent = Store.formatTime(hours);
                    summaryContainer.style.display = 'block';
                }
            } else {
                if (summaryContainer) summaryContainer.style.display = 'none';
            }
        };

        if (selectEmployee) selectEmployee.addEventListener('change', applyFilters);
        if (selectMonth) selectMonth.addEventListener('change', applyFilters);

        // Initial render
        await applyFilters();

        const exportBtn = document.getElementById('btn-export');
        if (exportBtn) {
            // Remove any old listener just in case (though SPA re-renders usually clean headers)
            exportBtn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const empId = selectEmployee ? selectEmployee.value : 'ALL';
                const monthId = selectMonth ? selectMonth.value : 'ALL';
                await Store.exportEmployeeCSV(empId, monthId);
                return false;
            };
        }
    }
};

