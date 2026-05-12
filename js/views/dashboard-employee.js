import { Store } from '../store.js';

export const EmployeeDashboard = {
    render() {
        const user = Store.getUser();
        return `
            <div style="width: 100%; min-height: 100vh; background: var(--bg-page);">
                <nav class="navbar">
                    <div class="nav-brand">
                        <img src="assets/logo.png" alt="MUSARAÑA" style="height: 48px;">
                    </div>
                    <div class="user-info">
                        <a href="#/manual" class="btn btn-secondary" style="background: #EEF2FF; color: #6366F1; border: none; font-size: 0.85rem; padding: 0.5rem 1rem;">📖 Manual</a>
                        <span class="user-role">Empleado</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${user.full_name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>

                <div class="container py-4">
                    <div class="dashboard-grid">
                        <!-- Main Action Column -->
                        <div class="glass-panel d-flex flex-column align-center justify-center" style="padding: 2rem;">
                            <div id="status-badge-container" style="margin-bottom: 1.5rem;">
                                <!-- Filled by init -->
                            </div>
                            
                            <div id="timer-display" style="display: none; margin-bottom: 1.5rem; font-family: monospace; font-size: 2.5rem; font-weight: 700; color: var(--primary);">
                                00:00:00
                            </div>

                            <div class="clock-btn-container" style="margin: 0;">
                                <button id="btn-clock-action" class="clock-btn">
                                    <div id="btn-icon"></div>
                                    <span id="btn-text" style="font-size: 0.9rem;">Cargando...</span>
                                </button>
                            </div>
                            
                            <div class="form-group mt-2" style="width: 100%; max-width: 280px; margin-bottom: 0;">
                                <input type="text" id="record-notes" class="form-control" placeholder="Añadir nota (opcional)..." style="text-align: center; font-size: 0.9rem; padding: 0.5rem;">
                            </div>
                        </div>

                        <!-- History Column -->
                        <div class="d-flex flex-column gap-1">
                            <div class="glass-panel" style="padding: 1.5rem;">
                                <h3 style="margin-top: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">📊 Histórico y Validación</h3>
                                
                                <div class="form-group" style="margin-bottom: 1rem;">
                                    <label class="form-label" style="font-size: 0.8rem;">Periodo a Consultar</label>
                                    <select id="employee-month-filter" class="form-control" style="padding: 0.5rem; font-size: 0.9rem;">
                                        <!-- Filled by init -->
                                    </select>
                                </div>

                                <div id="validation-panel" style="display: none;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: rgba(0,0,0,0.03); border-radius: var(--radius-sm); margin-bottom: 1rem;">
                                        <span style="font-size: 0.9rem;">Total Horas Mes:</span>
                                        <strong id="history-total-hours" style="font-size: 1.1rem; color: var(--primary);">00:00</strong>
                                    </div>

                                    <div id="employee-export-buttons" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
                                        <button class="btn" id="btn-employee-csv" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; background: white; border: 1px solid var(--border); color: var(--text-secondary);">📄 Descargar CSV</button>
                                        <button class="btn" id="btn-employee-pdf" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; background: #6366F1; color: white; border: none;">📋 Ver Reporte PDF</button>
                                    </div>

                                    <div id="signature-container">
                                        <!-- Filled by updatePeriod -->
                                    </div>
                                </div>
                            </div>

                            <div class="glass-panel" style="padding: 1.5rem; flex-grow: 1;">
                                <h3 style="margin-top: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">🕒 Movimientos Recientes</h3>
                                <div class="table-container">
                                    <table class="table" id="personal-records" style="font-size: 0.85rem;">
                                        <thead>
                                            <tr>
                                                <th>Fecha/Hora</th>
                                                <th style="text-align: right;">Tipo</th>
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

                    <!-- Vacaciones y Ausencias -->
                    <div style="margin-top: 1rem; width: 100%;">
                        <div class="glass-panel" style="padding: 1rem;" id="panel-mis-vacaciones">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:0.75rem;">
                                <h3 style="margin:0; font-size:1.25rem;">🏖️ Mis Vacaciones</h3>
                                <button id="btn-request-absence" class="btn btn-primary" style="background:#F59E0B; border:none; padding: 0.5rem 1rem; font-weight:600;">+ Solicitar</button>
                            </div>
 
                                 <!-- Progress bar vacaciones -->
                                 <div id="vacation-progress-container" style="margin-bottom:1.5rem;"></div>
                                <div id="request-absence-form-container" style="display:none;padding:1.5rem;background:#FFFBEB;border-radius:var(--radius-md);margin-bottom:1.5rem;border:1px solid #F59E0B;">
                                    <h4>Nueva Solicitud</h4>
                                    <form id="request-absence-form" style="margin-top:1rem;">
                                        <div class="responsive-grid">
                                            <div class="form-group" style="margin-bottom:0;">
                                                <label class="form-label">Tipo</label>
                                                <select id="req-ab-type" class="form-control" required>
                                                    <option value="vacation">🏖️ Vacaciones</option>
                                                    <option value="sick_leave">🤒 Baja Médica</option>
                                                    <option value="personal">🧾 Asunto Personal</option>
                                                    <option value="other">📋 Otro</option>
                                                </select>
                                            </div>
                                            <div class="form-group" style="margin-bottom:0;">
                                                <label class="form-label">Observaciones</label>
                                                <input type="text" id="req-ab-notes" class="form-control" placeholder="Motivo (opcional)...">
                                            </div>
                                            <div class="form-group" style="margin-bottom:0;">
                                                <label class="form-label">Fecha Inicio</label>
                                                <input type="date" id="req-ab-start" class="form-control" required>
                                            </div>
                                            <div class="form-group" style="margin-bottom:0;">
                                                <label class="form-label">Fecha Fin</label>
                                                <input type="date" id="req-ab-end" class="form-control" required>
                                            </div>
                                        </div>
                                        <div style="margin-top:1rem;display:flex;gap:0.5rem;">
                                            <button type="submit" class="btn btn-primary">Enviar Solicitud</button>
                                            <button type="button" id="btn-cancel-request" class="btn" style="background:white;border:1px solid var(--border);">Cancelar</button>
                                        </div>
                                        <p style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.5rem;">La solicitud quedará en estado Pendiente hasta que sea aprobada.</p>
                                    </form>
                                </div>

                                <!-- Listado mis ausencias -->
                                <div class="table-container">
                                    <table class="table" id="my-absences-table" style="font-size: 0.85rem;">
                                        <thead><tr><th>Tipo</th><th>Inicio</th><th>Fin</th><th style="text-align:center;">Días</th><th>Estado</th><th>Notas</th></tr></thead>
                                        <tbody><tr><td colspan="6" class="text-center text-secondary">Cargando...</td></tr></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    <!-- Profile Section -->
                    <div style="margin-top: 1rem; width: 100%;">
                        <div class="glass-panel" style="padding: 1.25rem;">
                            <h3 style="margin-top: 0; font-size: 1.15rem; display: flex; align-items: center; gap: 0.5rem;">⚙️ Configuración de Perfil</h3>
                            <form id="profile-form" class="responsive-grid" style="max-width: 800px;">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Nombre para Mostrar</label>
                                    <input type="text" id="profile-name" class="form-control" value="${user.full_name}" required>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Nueva Contraseña</label>
                                    <input type="password" id="profile-password" class="form-control" placeholder="Dejar en blanco para no cambiar">
                                </div>
                                <div style="margin-top: 0.5rem;">
                                    <button type="submit" class="btn btn-primary" style="padding: 0.6rem 1.25rem; font-size: 0.9rem;">Actualizar Perfil</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                <footer>
                    <img src="assets/logo.png" alt="MUSARAÑA">
                    <div class="footer-tag">Sistema de Registro Horario Certificado</div>
                    <div class="copyright">Musaraña &copy; 2026 &bull; Gestión Integral de Museos</div>
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
        await this.initMyVacations();
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

        tbody.innerHTML = recent.map(r => {
            const dateStr = new Date(r.timestamp).toLocaleString();
            const isEntry = r.type === 'check_in';
            const badge = `<span class="badge ${isEntry ? 'badge-success' : 'badge-danger'}">${isEntry ? 'ENTRADA' : 'SALIDA'}</span>`;
            return `<tr>
                <td data-label="Fecha/Hora" style="font-family:monospace;">${dateStr}</td>
                <td data-label="Tipo" style="text-align:right;">${badge}</td>
            </tr>`;
        }).join('');
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

                // Attach export listeners
                document.getElementById('btn-employee-csv').onclick = () => {
                    Store.exportEmployeeCSV(user.id, selectedMonth);
                };
                document.getElementById('btn-employee-pdf').onclick = () => {
                    Store.exportEmployeePDF(user.id, selectedMonth);
                };
            };

            monthFilter.onchange = updatePeriod;
            await updatePeriod();
        } else {
            monthFilter.innerHTML = '<option value="">Sin datos aún</option>';
        }
    },

    async initMyVacations() {
        const user = Store.getUser();
        const year = new Date().getFullYear();

        // Load allowance and used days
        const allowance = await Store.getOrCreateAllowance(user.id);
        const total = allowance?.total_days ?? Store.DEFAULT_VACATION_DAYS;
        const used = await Store.getUsedVacationDays(user.id, year);
        const avail = Math.max(0, total - used);
        const pct = Math.min(100, Math.round((used / total) * 100));
        const barColor = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#10B981';
        const exhausted = avail === 0;

        const progressContainer = document.getElementById('vacation-progress-container');
        if (progressContainer) {
            progressContainer.innerHTML = `
                <div style="background:${exhausted ? '#FEF2F2' : '#F0FDF4'};border:1px solid ${exhausted ? '#FCA5A5' : '#86EFAC'};border-radius:var(--radius-md);padding:1rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;gap:0.25rem;">
                        <strong style="font-size:0.95rem;">🌴 Vacaciones ${year}</strong>
                        <span style="font-size:0.8rem;color:var(--text-secondary);">${used} de ${total} días</span>
                    </div>
                    <div style="background:#e5e7eb;border-radius:999px;height:10px;overflow:hidden;margin: 0.5rem 0;">
                        <div style="background:${barColor};height:100%;width:${pct}%;border-radius:999px;transition:width 0.6s ease;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-secondary);flex-wrap:wrap;gap:0.5rem;">
                        <span>${pct}% consumido</span>
                        ${exhausted ? '<span style="color:#EF4444;font-weight:700;">⚠️ Agotadas</span>' : `<span style="color:${barColor};font-weight:600;">${avail} disp.</span>`}
                    </div>
                </div>`;
        }

        // Request form
        document.getElementById('btn-request-absence')?.addEventListener('click', () => {
            document.getElementById('request-absence-form').reset();
            document.getElementById('request-absence-form-container').style.display = 'block';
            document.getElementById('btn-request-absence').style.display = 'none';
        });
        document.getElementById('btn-cancel-request')?.addEventListener('click', () => {
            document.getElementById('request-absence-form-container').style.display = 'none';
            document.getElementById('btn-request-absence').style.display = 'block';
        });
        document.getElementById('request-absence-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const startVal = document.getElementById('req-ab-start').value;
            const endVal = document.getElementById('req-ab-end').value;
            if (endVal < startVal) return Store.showToast('La fecha de fin no puede ser anterior a la de inicio', 'error');
            const ok = await Store.saveAbsence({
                user_id: user.id,
                type: document.getElementById('req-ab-type').value,
                start_date: startVal,
                end_date: endVal,
                notes: document.getElementById('req-ab-notes').value,
                status: 'pending',
                requested_by_employee: true
            });
            if (ok) {
                Store.showToast('Solicitud enviada. Quedará pendiente de aprobación.', 'success');
                document.getElementById('request-absence-form-container').style.display = 'none';
                document.getElementById('btn-request-absence').style.display = 'block';
                document.getElementById('request-absence-form').reset();
                await this.renderMyAbsences(user.id);
            } else {
                Store.showToast('Error al enviar la solicitud', 'error');
            }
        });

        await this.renderMyAbsences(user.id);
    },

    async renderMyAbsences(userId) {
        const tbody = document.querySelector('#my-absences-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="loader-sm" style="display:inline-block"></div></td></tr>';
        const absences = await Store.getAbsences({ userId });
        if (absences.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary">No tienes ausencias registradas.</td></tr>';
            return;
        }
        const typeLabels = { vacation: '🏖️ Vacaciones', sick_leave: '🤒 Baja Médica', personal: '🧾 Asunto Personal', other: '📋 Otro' };
        const statusConfig = { pending: { label: '⏳ Pendiente', color: '#92400E', bg: '#FEF3C7' }, approved: { label: '✅ Aprobada', color: '#065F46', bg: '#D1FAE5' }, denied: { label: '❌ Denegada', color: '#991B1B', bg: '#FEE2E2' } };
        tbody.innerHTML = absences.map(a => {
            const sc = statusConfig[a.status] || statusConfig.pending;
            return `<tr>
                <td data-label="Tipo">${typeLabels[a.type] || a.type}</td>
                <td data-label="Inicio" style="font-family:monospace;">${a.start_date}</td>
                <td data-label="Fin" style="font-family:monospace;">${a.end_date}</td>
                <td data-label="Días" style="text-align:center;"><strong>${a.working_days || 0}</strong></td>
                <td data-label="Estado"><span style="background:${sc.bg};color:${sc.color};padding:2px 10px;border-radius:999px;font-size:0.75rem;font-weight:700;">${sc.label}</span></td>
                <td data-label="Notas" style="font-size:0.8rem;color:var(--text-secondary);">${a.notes || '-'}</td>
            </tr>`;
        }).join('');
    }
};
