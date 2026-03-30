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
                        <span style="font-weight: 500;">${user.full_name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container mt-6">
                    <div class="glass-panel" style="padding: 2.5rem; max-width: 800px; margin: 0 auto;">
                        <div style="text-align: center; margin-bottom: 3rem;">
                            <h2 class="mb-4">Registro de Jornada</h2>
                            <div id="monthly-summary-box" style="background: rgba(140, 198, 63, 0.1); color: var(--primary); padding: 1.5rem; border-radius: var(--radius-md); font-weight: 600; border: 1px solid rgba(140, 198, 63, 0.3); display: inline-block; min-width: 300px;">
                                ⏳ Cómputo Mes Actual: <span id="monthly-hours" style="font-size: 1.5rem; margin-left: 0.5rem;">Cargando...</span>
                            </div>
                        </div>

                        <div style="max-width: 500px; margin: 0 auto 3rem auto; text-align: center;">
                            <p class="mb-6">Registra tu entrada o salida. Puedes añadir una breve observación si es necesario.</p>
                            <div class="mb-4">
                                <input type="text" id="record-notes" class="form-control" placeholder="Observaciones (ej. Visita cliente, médico...)" style="background: white; border: 1px solid var(--border);">
                            </div>
                            <div class="clock-btn-container" id="btn-container">
                                <div class="loader"></div>
                            </div>
                        </div>
                        
                        <div class="dashboard-grid" style="grid-template-columns: 1fr 1fr; gap: 2rem;">
                            <div>
                                <h3 class="mb-4">📋 Movimientos Recientes</h3>
                                <div class="table-container" style="background: white;">
                                    <table class="table" id="personal-records">
                                        <thead>
                                            <tr>
                                                <th>Fecha/Hora</th>
                                                <th>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr><td colspan="2" class="text-center">Cargando...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                                    <h3 style="margin: 0;">📊 Histórico y Validación</h3>
                                </div>
                                <div style="background: white; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
                                    <label class="form-label">Seleccionar Mes</label>
                                    <select id="employee-month-filter" class="form-control mb-4" style="background: var(--bg-page);">
                                        <!-- Filled dynamically -->
                                    </select>
                                    
                                    <div id="validation-panel" style="display: none;">
                                        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem; text-transform: uppercase;">TOTAL DEL PERIODO</div>
                                        <div id="employee-history-result" style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 1.5rem;">0h 0m</div>
                                        
                                        <div id="signature-status-container">
                                            <!-- Status or Button -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--border);">
                            <h3 class="mb-4">⚙️ Mi Perfil</h3>
                            <form id="profile-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                                <div class="form-group">
                                    <label class="form-label">Nombre Completo</label>
                                    <input type="text" id="profile-name" class="form-control" value="${user.full_name}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Nueva Contraseña</label>
                                    <input type="password" id="profile-password" class="form-control" placeholder="Dejar vacío para no cambiar">
                                </div>
                                <div style="grid-column: 1 / -1; text-align: right;">
                                    <button type="submit" class="btn btn-primary">Actualizar Datos</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async init() {
        await this.renderStatus();
        await this.renderHistory();
        await this.initCompliance();
        this.initProfileForm();
    },

    async initCompliance() {
        const user = Store.getUser();
        const monthFilter = document.getElementById('employee-month-filter');
        const validationPanel = document.getElementById('validation-panel');
        const historyResult = document.getElementById('employee-history-result');
        const signatureContainer = document.getElementById('signature-status-container');

        if (!monthFilter) return;

        // Fetch records once to get available months
        const records = await Store.getRecords({ userId: user.id });
        const months = Store.getAvailableMonths(records);
        
        if (months.length > 0) {
            monthFilter.innerHTML = months.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
            
            const updatePeriod = async () => {
                const selectedMonth = monthFilter.value;
                const hours = await Store.calculateMonthlyHours(user.id, selectedMonth);
                historyResult.textContent = Store.formatTime(hours);
                validationPanel.style.display = 'block';

                // Check validation status from records in that period
                const periodRecords = await Store.getRecords({ userId: user.id, month: selectedMonth });
                const isSigned = periodRecords.length > 0 && periodRecords.every(r => r.is_validated);

                if (isSigned) {
                    signatureContainer.innerHTML = `
                        <div style="background: #ECFDF5; border: 1px solid #10B981; color: #065F46; padding: 1rem; border-radius: var(--radius-sm); font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Certificado el ${new Date(periodRecords[0].validation_date).toLocaleDateString()}
                        </div>
                    `;
                } else if (periodRecords.length > 0) {
                    signatureContainer.innerHTML = `
                        <button class="btn btn-block" id="btn-sign-compliance" style="background: var(--text-primary); color: white; margin-top: 1rem;">
                            Confirmar y Firmar Mes
                        </button>
                        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem; text-align: center;">
                            Al firmar, confirmas que los registros arriba mostrados son correctos conforme al Art. 34.9 ET.
                        </p>
                    `;
                    
                    document.getElementById('btn-sign-compliance').addEventListener('click', async (e) => {
                        const btn = e.target;
                        btn.disabled = true;
                        btn.innerHTML = '<span class="loader-sm"></span> Procesando...';
                        
                        const success = await Store.validateMonth(user.id, selectedMonth);
                        if (success) {
                            Store.showToast('Mes validado correctamente', 'success');
                            updatePeriod();
                        } else {
                            Store.showToast('Error al validar', 'error');
                            btn.disabled = false;
                        }
                    });
                } else {
                    signatureContainer.innerHTML = '<p class="text-secondary" style="font-size: 0.9rem;">Sin registros en este periodo.</p>';
                }
            };

            monthFilter.addEventListener('change', updatePeriod);
            await updatePeriod();
        } else {
            monthFilter.innerHTML = '<option value="">Sin datos</option>';
        }
    },

    async renderStatus() {
        const user = Store.getUser();
        const status = await Store.getEmployeeStatus(user.id);
        const container = document.getElementById('btn-container');
        const hoursDisplay = document.getElementById('monthly-hours');

        if (hoursDisplay) {
            const currentHours = await Store.calculateMonthlyHours(user.id);
            hoursDisplay.textContent = Store.formatTime(currentHours);
        }

        if (!container) return;
        
        if (status === 'OUT') {
            container.innerHTML = `
                <button class="clock-btn clock-in" id="action-btn" data-action="IN" style="width: 100%; height: 120px;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    <span>FICHAR ENTRADA</span>
                </button>
            `;
        } else {
            container.innerHTML = `
                <button class="clock-btn clock-out" id="action-btn" data-action="OUT" style="width: 100%; height: 120px;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span>FICHAR SALIDA</span>
                </button>
            `;
        }

        document.getElementById('action-btn').addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            btn.disabled = true;
            const action = btn.getAttribute('data-action');
            const notesField = document.getElementById('record-notes');
            const notes = notesField ? notesField.value : '';

            await Store.clockAction(user.id, action, notes);
            Store.showToast(action === 'IN' ? 'Entrada registrada' : 'Salida registrada', 'success');
            
            if (notesField) notesField.value = '';
            await this.renderStatus();
            await this.renderHistory();
            await this.initCompliance(); // Refresh total hours in validation panel
        });
    },

    async renderHistory() {
        const user = Store.getUser();
        const records = await Store.getRecords({ userId: user.id });
        const recent = records.slice(0, 5);
        
        const tbody = document.querySelector('#personal-records tbody');
        if (!tbody) return;

        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-secondary">No hay registros.</td></tr>';
            return;
        }

        tbody.innerHTML = recent.map(r => `
            <tr>
                <td style="font-size: 0.9rem;">
                    <div>${new Date(r.timestamp).toLocaleDateString()}</div>
                    <div style="font-size: 0.8rem; opacity: 0.6;">${new Date(r.timestamp).toLocaleTimeString()}</div>
                </td>
                <td>
                    <span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type === 'IN' ? 'ENTRADA' : 'SALIDA'}</span>
                    ${r.is_validated ? '<span style="color: var(--secondary); margin-left: 0.5rem; font-size: 1.1rem;">✔</span>' : ''}
                </td>
            </tr>
        `).join('');
    },

    initProfileForm() {
        const user = Store.getUser();
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newName = document.getElementById('profile-name').value;
                const newPass = document.getElementById('profile-password').value;
                
                const updated = await Store.updateProfile(user.id, newName, newPass || null);
                if (updated) {
                    Store.showToast('Perfil actualizado');
                    Router.render();
                } else {
                    Store.showToast('Error al actualizar', 'error');
                }
            });
        }
    }
};
