import { Store } from '../store.js';

export const AuditorDashboard = {
    render() {
        const user = Store.getUser();
        if (!user) return '';

        return `
            <div style="width: 100%;">
                <nav class="navbar" style="background: rgba(239, 68, 68, 0.05);">
                    <div class="nav-brand"><img src="assets/logo.png" alt="MUSARANA" style="height: 48px;"> <span style="font-size: 0.9rem; margin-left: 1rem; color: var(--danger);">Inspectoría Legal</span></div>
                    <div class="user-info">
                        <span class="user-role" style="background: #FEE2E2; color: #991B1B;">Inspectoría</span>
                        <span style="font-weight: 500;">${user.name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container mt-6">
                    <div class="glass-panel" style="padding: 2rem;">
                        <div style="margin-bottom: 2rem;">
                            <h2 style="margin-bottom: 0.5rem;">Auditoría de Registros</h2>
                            <p class="text-secondary" style="margin-top: 0;">Registro de jornada conforme al artículo 34.9 del Estatuto de los Trabajadores (RDL 8/2019).</p>
                        </div>
                        
                        <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 2rem;">
                                <select id="export-filter-employee" class="form-control" style="width: auto; background: white;">
                                    <option value="ALL">Todos los Empleados</option>
                                </select>
                                <select id="export-filter-month" class="form-control" style="width: auto; background: white;">
                                    <option value="ALL">Histórico Completo (Sin filtro de mes)</option>
                                    <!-- Filled dynamically -->
                                </select>
                                <button class="btn btn-primary" id="btn-export">Exportar CSV</button>
                            </div>
                        </div>
                        
                        <div id="audit-summary-container" style="display: none; background: #DBEAFE; color: #1E40AF; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 2rem; font-weight: 500;">
                            Cómputo Total del Trabajador (Este mes): <span id="audit-monthly-hours" style="font-weight: 800; font-size: 1.1rem;">0h 0m</span>
                        </div>

                        <div class="table-container">
                            <table class="table" id="audit-records">
                                <thead>
                                    <tr>
                                        <th>UUID (Hash del Registro)</th>
                                        <th>Empleado</th>
                                        <th>Marca de Tiempo ISO</th>
                                        <th>Tipo de Fichaje</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Filled dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const allRecords = Store.getRecords().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        const tbody = document.querySelector('#audit-records tbody');
        
        if (!tbody) return;

        // Populate filter dropdowns
        const selectEmployee = document.getElementById('export-filter-employee');
        const selectMonth = document.getElementById('export-filter-month');
        const employees = Store.adminGetAllUsers ? Store.adminGetAllUsers().filter(u => u.role === 'employee') : [];
        
        if (selectEmployee) {
            employees.forEach(emp => {
                const opt = document.createElement('option');
                opt.value = emp.id;
                opt.textContent = emp.name;
                selectEmployee.appendChild(opt);
            });
        }

        const availableMonths = Store.getAvailableMonths();
        if (selectMonth) {
            availableMonths.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = Store.formatMonthLabel(m);
                selectMonth.appendChild(opt);
            });
            if (availableMonths.length > 0) selectMonth.value = availableMonths[0]; // Default newest month
        }

        const renderTable = (records) => {
            if (records.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-secondary">No hay registros para mostrar.</td></tr>';
            } else {
                tbody.innerHTML = records.map(r => `
                    <tr>
                        <td style="font-family: monospace; font-size: 0.85rem; color: #6B7280; user-select: all;">${r.id.toString(16).toUpperCase()}-${r.userId}F</td>
                        <td style="font-weight: 500;">${r.userName}</td>
                        <td style="font-family: monospace; font-size: 0.9rem;">${r.timestamp}</td>
                        <td><span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type === 'IN' ? 'ENTRADA' : 'SALIDA'}</span></td>
                        <td style="font-size: 0.85rem; color: var(--text-secondary); max-width: 150px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${r.notes || ''}">${r.notes ? r.notes : '<span style="opacity:0.3">-</span>'}</td>
                    </tr>
                `).join('');
            }
        };

        const applyFilters = () => {
            const empId = selectEmployee ? selectEmployee.value : 'ALL';
            const monthId = selectMonth ? selectMonth.value : 'ALL';
            
            let filteredRecords = allRecords;
            
            if (empId !== 'ALL') {
                filteredRecords = filteredRecords.filter(r => r.userId == empId);
            }

            if (monthId !== 'ALL') {
                const [year, month] = monthId.split('-');
                filteredRecords = filteredRecords.filter(r => {
                    const d = new Date(r.timestamp);
                    return d.getFullYear() === parseInt(year) && d.getMonth() === (parseInt(month) - 1);
                });
            }

            renderTable(filteredRecords);

            const summaryContainer = document.getElementById('audit-summary-container');
            const summaryText = document.getElementById('audit-monthly-hours');

            if (empId !== 'ALL' && monthId !== 'ALL') {
                if (summaryContainer && summaryText) {
                    summaryText.textContent = Store.formatTime(Store.calculateMonthlyHours(empId, monthId));
                    summaryContainer.style.display = 'block';
                }
            } else {
                if (summaryContainer) summaryContainer.style.display = 'none';
            }
        };

        if (selectEmployee) selectEmployee.addEventListener('change', applyFilters);
        if (selectMonth) selectMonth.addEventListener('change', applyFilters);

        // Initial render
        applyFilters();

        const exportBtn = document.getElementById('btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const empId = selectEmployee ? selectEmployee.value : 'ALL';
                const monthId = selectMonth ? selectMonth.value : 'ALL';
                Store.exportEmployeeCSV(empId, monthId);
            });
        }
    }
};
