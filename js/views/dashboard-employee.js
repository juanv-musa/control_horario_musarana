import { Store } from '../store.js';
import { Router } from '../router.js';

export const EmployeeDashboard = {
    render() {
        const user = Store.getUser();
        if (!user) return '';

        return `
            <div style="width: 100%;">
                <nav class="navbar">
                    <div class="nav-brand"><img src="assets/logo.png" alt="MUSARANA" style="height: 48px;"></div>
                    <div class="user-info">
                        <span class="user-role">Empleado</span>
                        <span style="font-weight: 500;">${user.name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container mt-6">
                    <div class="glass-panel" style="padding: 2rem; max-width: 600px; margin: 0 auto; text-align: center;">
                        <h2 class="mb-4">Registro Activo</h2>
                        <div style="background: rgba(140, 198, 63, 0.1); color: var(--primary); padding: 1rem; border-radius: var(--radius-md); font-weight: 600; margin-bottom: 2rem; border: 1px solid rgba(140, 198, 63, 0.3);">
                            ⏳ Cómputo Mensual Consolidado: <span id="monthly-hours" style="font-size: 1.25rem;">0h 0m</span>
                        </div>
                        <p class="mb-6">Por favor, registra el inicio o fin de tu jornada.</p>
                        
                        <div class="mb-4" style="max-width: 400px; margin: 0 auto; text-align: left;">
                            <input type="text" id="record-notes" class="form-control" placeholder="Observaciones o justificación (Opcional)" style="background: rgba(255,255,255,0.7); font-size: 0.95rem;">
                        </div>

                        <div class="clock-btn-container" id="btn-container">
                            <!-- Filled dynamically by init() -->
                        </div>

                        <div style="margin-top: 2rem; text-align: left;">
                            <h3 class="mb-4">Tus últimos registros</h3>
                            <div class="table-container">
                                <table class="table" id="personal-records">
                                    <thead>
                                        <tr>
                                            <th>Fecha/Hora</th>
                                            <th>Acción</th>
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

                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                                <h3 style="margin: 0;">📊 Histórico de Jornadas</h3>
                                <select id="employee-month-filter" class="form-control" style="width: auto; background: white;">
                                    <!-- Filled dynamically -->
                                </select>
                            </div>
                            <div style="background: rgba(140, 198, 63, 0.05); padding: 1.5rem; text-align: center; border-radius: var(--radius-sm); border: 1px solid rgba(140, 198, 63, 0.2);">
                                <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">TOTAL ACUMULADO</div>
                                <div id="employee-history-result" style="font-size: 2rem; font-weight: 800; color: var(--primary); font-family: monospace;">0h 0m</div>
                            </div>

                        <div style="margin-top: 3rem; text-align: left; border-top: 1px solid var(--border); padding-top: 2rem;">
                            <h3 class="mb-4">⚙️ Configuración de Perfil</h3>
                            <form id="profile-form">
                                <div class="form-group">
                                    <label class="form-label">Nombre para Mostrar</label>
                                    <input type="text" id="profile-name" class="form-control" value="${user.name}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Nueva Contraseña</label>
                                    <input type="password" id="profile-password" class="form-control" placeholder="Dejar en blanco para conservar la actual">
                                </div>
                                <button type="submit" class="btn btn-primary">Actualizar Perfil</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        this.renderStatus();
        this.renderHistory();
        this.initProfileForm();
    },

    initProfileForm() {
        const user = Store.getUser();
        
        // Render History Dropdown
        const monthFilter = document.getElementById('employee-month-filter');
        const historyResult = document.getElementById('employee-history-result');
        if (monthFilter && historyResult) {
            const months = Store.getAvailableMonths();
            if (months.length > 0) {
                monthFilter.innerHTML = months.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
                
                const updateHistory = () => {
                    const selectedMonth = monthFilter.value;
                    historyResult.textContent = Store.formatTime(Store.calculateMonthlyHours(user.id, selectedMonth));
                };

                monthFilter.addEventListener('change', updateHistory);
                updateHistory(); // Load initial
            } else {
                monthFilter.innerHTML = `<option value="">Sin historial</option>`;
                historyResult.textContent = '0h 0m';
            }
        }

        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newName = document.getElementById('profile-name').value;
                const newPass = document.getElementById('profile-password').value;
                
                const updated = Store.updateProfile(user.id, newName, newPass || null);
                if (updated) {
                    Store.showToast('Perfil actualizado correctamente');
                    Router.render();
                } else {
                    Store.showToast('Error al actualizar el perfil', 'error');
                }
            });
        }
    },

    renderStatus() {
        const user = Store.getUser();
        const status = Store.getEmployeeStatus(user.id);
        const container = document.getElementById('btn-container');

        const hoursDisplay = document.getElementById('monthly-hours');
        if (hoursDisplay) {
            hoursDisplay.textContent = Store.formatTime(Store.calculateMonthlyHours(user.id));
        }

        if (!container) return;
        
        if (status === 'OUT') {
            container.innerHTML = `
                <button class="clock-btn clock-in" id="action-btn" data-action="IN">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    FICHAR ENTRADA
                </button>
            `;
        } else {
            container.innerHTML = `
                <button class="clock-btn clock-out" id="action-btn" data-action="OUT">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    FICHAR SALIDA
                </button>
            `;
        }

        document.getElementById('action-btn').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const action = btn.getAttribute('data-action');
            const notesField = document.getElementById('record-notes');
            const notes = notesField ? notesField.value : '';

            Store.clockAction(user.id, action, notes);
            Store.showToast(action === 'IN' ? 'Entrada registrada' : 'Salida registrada', 'success');
            
            // Clear notes field
            if (notesField) notesField.value = '';

            // Re-render UI
            this.renderStatus();
            this.renderHistory();
        });
    },

    renderHistory() {
        const user = Store.getUser();
        const records = Store.getRecords().filter(r => r.userId === user.id).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
        
        const tbody = document.querySelector('#personal-records tbody');
        if (!tbody) return;

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-secondary">No hay registros recientes.</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(r => `
            <tr>
                <td>${new Date(r.timestamp).toLocaleString('es-ES')}</td>
                <td><span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type === 'IN' ? 'ENTRADA' : 'SALIDA'}</span></td>
                <td style="font-size: 0.85rem; color: var(--text-secondary); max-width: 150px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${r.notes || ''}">${r.notes ? r.notes : '<span style="opacity:0.3">-</span>'}</td>
            </tr>
        `).join('');
    }
};
