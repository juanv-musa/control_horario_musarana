import { Store } from '../store.js';

export const EmployeeDashboard = {
    render() {
        const user = Store.getUser();
        return `
            <div style="width: 100%; min-height: 100vh; background: #f9fafb;">
                <nav class="navbar">
                    <div class="nav-brand"><img src="assets/logo.png" alt="MUSARAÑA" style="height: 48px;"></div>
                    <div class="user-info">
                        <a href="#/manual" class="btn btn-secondary" style="margin-right: 1rem; background: #EEF2FF; color: #6366F1; border: none; font-size: 0.85rem;">📖 Manual</a>
                        <span class="user-role">Empleado</span>
                        <span style="font-weight: 500;">${user.full_name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>

                <div class="container py-4">
                    <div class="row">
                        <!-- Main Action Column -->
                        <div class="col-lg-6 mb-4">
                            <div class="glass-panel text-center" style="padding: 3rem 2rem;">
                                <div id="status-badge-container" style="margin-bottom: 2rem;">
                                    <!-- Filled by init -->
                                </div>
                                
                                <div id="timer-display" style="display: none; margin-bottom: 2rem; font-family: monospace; font-size: 2.5rem; font-weight: 700; color: var(--primary);">
                                    00:00:00
                                </div>

                                <button id="btn-clock-action" class="clock-btn">
                                    <div id="btn-icon"></div>
                                    <span id="btn-text">Cargando...</span>
                                </button>
                                
                                <div class="form-group mt-4" style="max-width: 300px; margin-left: auto; margin-right: auto;">
                                    <input type="text" id="record-notes" class="form-control" placeholder="Añadir nota (opcional)..." style="text-align: center;">
                                </div>
                            </div>
                        </div>

                        <!-- History Column -->
                        <div class="col-lg-6">
                            <div class="glass-panel" style="margin-bottom: 2rem;">
                                <h3 style="margin-top: 0;">📊 Histórico y Validación</h3>
                                
                                <div class="form-group">
                                    <label class="form-label">Periodo a Consultar</label>
                                    <select id="employee-month-filter" class="form-control">
                                        <!-- Filled by init -->
                                    </select>
                                </div>

                                <div id="validation-panel" style="display: none;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f3f4f6; border-radius: var(--radius-sm); margin: 1.5rem 0;">
                                        <span>Total Horas Mes:</span>
                                        <strong id="history-total-hours" style="font-size: 1.25rem; color: var(--primary);">00:00</strong>
                                    </div>

                                    <div id="signature-container">
                                        <!-- Filled by updatePeriod -->
                                    </div>
                                </div>
                            </div>

                            <div class="glass-panel">
                                <h3 style="margin-top: 0; font-size: 1rem;">🕒 Movimientos Recientes</h3>
                                <div class="table-container">
                                    <table class="table" id="personal-records">
                                        <thead>
                                            <tr>
                                                <th>Fecha/Hora</th>
                                                <th>Tipo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- Filled by renderHistory -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Profile Section -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="glass-panel" style="padding: 2rem;">
                                <h3 style="margin-top: 0;">⚙️ Configuración de Perfil</h3>
                                <form id="profile-form" class="responsive-grid" style="max-width: 800px;">
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label class="form-label">Nombre para Mostrar</label>
                                        <input type="text" id="profile-name" class="form-control" value="${user.full_name}" required>
                                    </div>
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label class="form-label">Nueva Contraseña</label>
                                        <input type="password" id="profile-password" class="form-control" placeholder="Dejar en blanco para no cambiar">
                                    </div>
                                    <div style="margin-top: 1rem;">
                                        <button type="submit" class="btn btn-primary">Actualizar Perfil</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                
                <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem; border-top: 1px solid var(--border); margin-top: 3rem; background: white;">
                    <p>Musaraña &copy; 2026</p>
                </footer>
            </div>
        `;
    },

    async init() {
        const user = Store.getUser();
        if (!user) return;

        await this.initClockAction();
        await this.initHistory();
        await this.initValidation();
        this.initProfile();
    },

    initProfile() {
        const user = Store.getUser();
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newName = document.getElementById('profile-name').value;
                const newPass = document.getElementById('profile-password').value;
                
                const updated = await Store.updateProfile(user.id, newName, newPass || null);
                if (updated) {
                    Store.showToast('Perfil actualizado correctamente', 'success');
                    window.location.reload(); 
                }
            });
        }
    },

    async initClockAction() {
        const user = Store.getUser();
        const btnClock = document.getElementById('btn-clock-action');
        const btnText = document.getElementById('btn-text');
        const btnIcon = document.getElementById('btn-icon');
        const statusContainer = document.getElementById('status-badge-container');
        const timerDisplay = document.getElementById('timer-display');
        const notesInput = document.getElementById('record-notes');
        
        let timerInterval = null;

        const updateUI = async (forcedStatus = null) => {
            const currentStatus = forcedStatus || await Store.getEmployeeStatus(user.id);
            const isWorking = (currentStatus === 'IN');

            if (timerInterval) clearInterval(timerInterval);

            if (isWorking) {
                btnClock.className = 'clock-btn clock-out';
                btnText.textContent = 'FICHAR SALIDA';
                btnIcon.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"/></svg>';
                statusContainer.innerHTML = '<span class="badge badge-active" style="padding: 0.5rem 1rem; font-size: 0.9rem;">● TRABAJANDO</span>';
                
                timerDisplay.style.display = 'block';
                const lastIn = await Store.getLastClockIn(user.id);
                
                if (lastIn) {
                    const startTime = new Date(lastIn.timestamp);
                    const startTimer = () => {
                        const now = new Date();
                        const diff = now - startTime;
                        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
                        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
                        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                        timerDisplay.textContent = `${h}:${m}:${s}`;
                    };
                    startTimer();
                    timerInterval = setInterval(startTimer, 1000);
                }
            } else {
                btnClock.className = 'clock-btn clock-in';
                btnText.textContent = 'FICHAR ENTRADA';
                btnIcon.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';
                statusContainer.innerHTML = '<span class="badge badge-inactive" style="padding: 0.5rem 1rem; font-size: 0.9rem;">● FUERA DE JORNADA</span>';
                timerDisplay.style.display = 'none';
            }
        };

        btnClock.onclick = async () => {
            btnClock.disabled = true;
            const currentStatus = await Store.getEmployeeStatus(user.id);
            const action = currentStatus === 'IN' ? 'OUT' : 'IN';
            const notes = notesInput.value;
            
            // UI Update first (Optimistic)
            await updateUI(action);
            
            await Store.clockAction(user.id, action, notes);
            notesInput.value = '';
            Store.showToast(action === 'IN' ? 'Entrada registrada' : 'Salida registrada', 'success');
            
            await this.initHistory();
            await this.initValidation();
            btnClock.disabled = false;
        };

        await updateUI();
    },

    async initHistory() {
        const user = Store.getUser();
        const records = await Store.getRecords({ userId: user.id });
        const tbody = document.querySelector('#personal-records tbody');
        if (!tbody) return;

        const recent = records.slice(0, 5);
        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" class="text-center text-secondary">No hay movimientos.</td></tr>';
            return;
        }

        tbody.innerHTML = recent.map(r => `
            <tr>
                <td style="font-size: 0.85rem; font-family: monospace;">
                    ${new Date(r.timestamp).toLocaleString('es-ES')}
                </td>
                <td>
                    <span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type === 'IN' ? 'ENTRADA' : 'SALIDA'}</span>
                </td>
            </tr>
        `).join('');
    },

    async initValidation() {
        const user = Store.getUser();
        const monthFilter = document.getElementById('employee-month-filter');
        const validationPanel = document.getElementById('validation-panel');
        const hoursDisplay = document.getElementById('history-total-hours');
        const signatureContainer = document.getElementById('signature-container');

        if (!monthFilter) return;

        const records = await Store.getRecords({ userId: user.id });
        const months = Store.getAvailableMonths(records);

        if (months.length > 0) {
            monthFilter.innerHTML = months.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
            
            const updatePeriod = async () => {
                const selectedMonth = monthFilter.value;
                const hours = await Store.calculateMonthlyHours(user.id, selectedMonth);
                hoursDisplay.textContent = Store.formatTime(hours);
                validationPanel.style.display = 'block';

                const periodRecords = await Store.getRecords({ userId: user.id, month: selectedMonth });
                const isSigned = periodRecords.length > 0 && periodRecords.every(r => r.is_validated);
                const isCompanySigned = periodRecords.length > 0 && periodRecords.every(r => r.is_company_validated);

                if (isSigned) {
                    signatureContainer.innerHTML = `
                        <div style="margin-top: 1rem;">
                            <div style="background: #ECFDF5; border: 1px solid #10B981; color: #065F46; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                <b>Tu Firma:</b> Validado ${new Date(periodRecords[0].validation_date).toLocaleDateString()}
                            </div>
                            <div style="background: ${isCompanySigned ? '#EEF2FF' : '#FFF7ED'}; border: 1px solid ${isCompanySigned ? '#6366F1' : '#F97316'}; color: ${isCompanySigned ? '#3730A3' : '#9A3412'}; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                <b>Firma Empresa:</b> ${isCompanySigned ? 'Validado' : 'Pendiente revisión'}
                            </div>
                        </div>
                    `;
                } else if (periodRecords.length > 0) {
                    signatureContainer.innerHTML = `
                        <button class="btn btn-primary btn-block" id="btn-sign-month" style="margin-top: 1.5rem;">✍️ Confirmar y Firmar Mes</button>
                        <p style="font-size: 0.7rem; color: var(--text-secondary); text-align: center; margin-top: 0.5rem;">Conforme al Art. 34.9 ET.</p>
                    `;
                    document.getElementById('btn-sign-month').onclick = async () => {
                        const success = await Store.validateMonth(user.id, selectedMonth);
                        if (success) {
                            Store.showToast('Mes firmado correctamente', 'success');
                            updatePeriod();
                        }
                    };
                }
            };

            monthFilter.onchange = updatePeriod;
            await updatePeriod();
        } else {
            monthFilter.innerHTML = '<option value="">Sin datos aún</option>';
        }
    }
};
