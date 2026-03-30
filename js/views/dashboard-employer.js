import { Store } from '../store.js';
import { Router } from '../router.js';

export const EmployerDashboard = {
    render() {
        const user = Store.getUser();
        if (!user) return '';

        return `
            <div style="width: 100%;">
                <nav class="navbar">
                    <div class="nav-brand"><img src="assets/logo.png" alt="MUSARAÑA" style="height: 48px;"></div>
                    <div class="user-info">
                        <span class="user-role">Musaraña</span>
                        <span style="font-weight: 500;">${user.full_name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container mt-6">
                    <div class="dashboard-grid">
                        <div class="glass-panel stat-card">
                            <span class="stat-title">Registros de Hoy</span>
                            <span class="stat-value" id="stats-today">...</span>
                        </div>
                        <div class="glass-panel stat-card">
                            <span class="stat-title">Personal Activo (IN)</span>
                            <span class="stat-value" id="stats-active">...</span>
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 2rem; margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <h2 style="margin: 0;">👥 Gestión de Personal</h2>
                            <div style="display: flex; gap: 1rem;">
                                <select id="employer-month-filter" class="form-control" style="width: auto; background: white;">
                                    <!-- Filled dynamically -->
                                </select>
                                <button class="btn btn-secondary" id="btn-toggle-new-user" style="background: var(--primary); color: white; padding: 0.5rem 1rem;">+ Añadir Empleado</button>
                            </div>
                        </div>
                        
                        <div id="new-user-form-container" style="display: none; padding: 1.5rem; background: rgba(243, 244, 246, 0.6); border-radius: var(--radius-md); margin-bottom: 2rem; border: 1px solid var(--border);">
                            <h4 id="new-user-title">Alta de Usuario</h4>
                            <form id="new-user-form" class="responsive-grid" style="margin-top: 1rem;">
                                <input type="hidden" id="nu-id">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Nombre Completo</label>
                                    <input type="text" id="nu-name" class="form-control" required>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Correo Electrónico (Login)</label>
                                    <input type="email" id="nu-username" class="form-control" required title="El correo será su nombre de usuario">
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Contraseña</label>
                                    <input type="password" id="nu-password" class="form-control" placeholder="Obligatorio para nuevos">
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Rol Interno</label>
                                    <select id="nu-role" class="form-control" required>
                                        <option value="employee">Empleado (Ficha horarios)</option>
                                        <option value="employer">Musarana (Control Total)</option>
                                        <option value="auditor">Auditoría (Lectura Legal)</option>
                                    </select>
                                </div>
                                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                    <button type="submit" class="btn btn-primary" id="nu-submit">Guardar Usuario</button>
                                    <button type="button" class="btn" id="btn-cancel-new-user" style="background: white; border: 1px solid var(--border);">Cancelar</button>
                                </div>
                            </form>
                        </div>

                        <div class="table-container">
                            <table class="table" id="users-table">
                                <thead>
                                    <tr>
                                        <th>Nombre Completo</th>
                                        <th>Horas (Periodo)</th>
                                        <th>Firma Empleado</th>
                                        <th>Firma Empresa</th>
                                        <th style="text-align: right;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Filled dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
                            <h2 style="margin: 0;">📅 Registro Global de Jornada</h2>
                            <div style="display: flex; gap: 1rem;">
                                <select id="employer-global-month-filter" class="form-control" style="width: auto; background: white;">
                                    <!-- Filled dynamically -->
                                </select>
                                <button class="btn btn-secondary" id="btn-add-manual-record" style="background: var(--text-primary); color: white; padding: 0.5rem 1rem;">+ Añadir Olvido</button>
                            </div>
                        </div>

                        <!-- Manual Record / Edit Form -->
                        <div id="record-form-container" style="display: none; padding: 1.5rem; background: #EEF2FF; border-radius: var(--radius-md); margin-bottom: 2rem; border: 1px solid #6366F1;">
                            <h4 id="record-form-title">Añadir Registro Manual</h4>
                            <form id="record-form" class="responsive-grid" style="margin-top: 1rem;">
                                <input type="hidden" id="rf-id">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Empleado</label>
                                    <select id="rf-user-id" class="form-control" required>
                                        <!-- Filled dynamically -->
                                    </select>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Fecha y Hora</label>
                                    <input type="datetime-local" id="rf-timestamp" class="form-control" required>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Tipo de Marca</label>
                                    <select id="rf-type" class="form-control" required>
                                        <option value="IN">ENTRADA</option>
                                        <option value="OUT">SALIDA</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Observación Corporativa</label>
                                    <input type="text" id="rf-notes" class="form-control" placeholder="Ej: Olvido de fichaje">
                                </div>
                                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                    <button type="submit" class="btn btn-primary" style="background: #4F46E5;">Guardar Cambios</button>
                                    <button type="button" class="btn" id="btn-cancel-record" style="background: white; border: 1px solid var(--border);">Cancelar</button>
                                </div>
                            </form>
                        </div>

                        <div class="table-container">
                            <table class="table" id="global-records">
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th>Fecha/Hora</th>
                                        <th>Acción</th>
                                        <th>Observaciones</th>
                                        <th style="text-align: right;">Corregir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Filled dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 2.5rem; margin-bottom: 2rem; border-left: 5px solid var(--danger);">
                        <h2 style="margin: 0; color: #991B1B;">🔐 Acceso Auditoría Externa</h2>
                        <p class="text-secondary" style="margin: 0.5rem 0 1.5rem 0;">Define el código (PIN) que usarán los inspectores para acceder al portal sin email.</p>
                        
                        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border); max-width: 500px;">
                            <div class="form-group">
                                <label class="form-label">Código de Acceso Actual (PIN)</label>
                                <div style="display: flex; gap: 1rem;">
                                    <input type="text" id="audit-pin-value" class="form-control" placeholder="Ej: 123456" style="font-family: monospace; font-weight: bold; font-size: 1.2rem;">
                                    <button id="btn-update-audit-pin" class="btn btn-primary">Actualizar</button>
                                </div>
                                <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">
                                    Nota: Cambie este código periódicamente para mayor seguridad.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 2rem; margin-top: 1.5rem;">
                        <h3 class="mb-4">⚙️ Configuración de Perfil</h3>
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
                
                <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem; border-top: 1px solid var(--border); margin-top: 3rem; background: white;">
                    <p>Musaraña &copy; 2026</p>
                </footer>
            </div>
        `;
    },

    async init() {
        const user = Store.getUser();
        const records = await Store.getRecords();
        const availableMonths = Store.getAvailableMonths(records);

        await this.updateSummaryStats();

        // Audit PIN Management
        const btnUpdatePin = document.getElementById('btn-update-audit-pin');
        if (btnUpdatePin) {
            btnUpdatePin.addEventListener('click', async () => {
                const newCode = document.getElementById('audit-pin-value').value;
                if (!newCode || newCode.length < 4) {
                    return Store.showToast('El código debe tener al menos 4 caracteres', 'error');
                }
                await Store.updateAuditCode(newCode);
            });
        }

        // Profile Form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newName = document.getElementById('profile-name').value;
                const newPass = document.getElementById('profile-password').value;
                
                const updated = await Store.updateProfile(user.id, newName, newPass || null);
                if (updated) {
                    Store.showToast('Perfil actualizado correctamente', 'success');
                    Router.render();
                }
            });
        }

        // Initialize User Management
        const monthFilter = document.getElementById('employer-month-filter');
        let targetMonth = availableMonths[0]; // Default to newest
        
        if (monthFilter && availableMonths.length > 0) {
            monthFilter.innerHTML = availableMonths.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
            monthFilter.addEventListener('change', async (e) => {
                targetMonth = e.target.value;
                await this.renderUsers(targetMonth);
            });
        }

        await this.renderUsers(targetMonth);

        const formContainer = document.getElementById('new-user-form-container');
        const toggleBtn = document.getElementById('btn-toggle-new-user');
        const cancelBtn = document.getElementById('btn-cancel-new-user');
        const userForm = document.getElementById('new-user-form');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                userForm.reset();
                document.getElementById('nu-id').value = '';
                document.getElementById('nu-username').parentElement.style.display = 'block';
                document.getElementById('nu-password').parentElement.style.display = 'block';
                
                document.getElementById('new-user-title').textContent = 'Alta de Usuario';
                formContainer.style.display = 'block';
                toggleBtn.style.display = 'none';
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                formContainer.style.display = 'none';
                toggleBtn.style.display = 'block';
            });
        }

        if (userForm) {
            userForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const userData = {
                    id: document.getElementById('nu-id').value,
                    name: document.getElementById('nu-name').value,
                    username: document.getElementById('nu-username').value,
                    role: document.getElementById('nu-role').value,
                    password: document.getElementById('nu-password').value
                };
                
                const res = await Store.adminSaveUser(userData);
                if (res.success) {
                    Store.showToast('Usuario guardado con éxito', 'success');
                    formContainer.style.display = 'none';
                    toggleBtn.style.display = 'block';
                    await this.renderUsers(targetMonth);
                } else {
                    Store.showToast(res.error, 'error');
                }
            });
        }

        // Initialize Global Records
        const globalMonthFilter = document.getElementById('employer-global-month-filter');
        let globalTargetMonth = availableMonths[0]; 
        
        // Record Form Logic
        const recordFormContainer = document.getElementById('record-form-container');
        const recordForm = document.getElementById('record-form');
        const btnAddRecord = document.getElementById('btn-add-manual-record');
        const btnCancelRecord = document.getElementById('btn-cancel-record');
        const rfUserSelect = document.getElementById('rf-user-id');

        if (btnAddRecord) {
            btnAddRecord.addEventListener('click', async () => {
                const users = await Store.adminGetAllUsers();
                rfUserSelect.innerHTML = users.map(u => `<option value="${u.id}" data-name="${u.full_name}">${u.full_name}</option>`).join('');
                recordForm.reset();
                document.getElementById('rf-id').value = '';
                document.getElementById('record-form-title').textContent = 'Añadir Registro Manual';
                recordFormContainer.style.display = 'block';
                btnAddRecord.style.display = 'none';
                
                const now = new Date();
                now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                document.getElementById('rf-timestamp').value = now.toISOString().slice(0, 16);
            });
        }

        if (btnCancelRecord) {
            btnCancelRecord.addEventListener('click', () => {
                recordFormContainer.style.display = 'none';
                btnAddRecord.style.display = 'block';
            });
        }

        if (recordForm) {
            recordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('rf-id').value;
                const userId = document.getElementById('rf-user-id').value;
                const opt = rfUserSelect.options[rfUserSelect.selectedIndex];
                const userName = opt.getAttribute('data-name');
                const timestamp = document.getElementById('rf-timestamp').value;
                const type = document.getElementById('rf-type').value;
                const notes = document.getElementById('rf-notes').value;

                let success = false;
                if (id) {
                    success = await Store.adminUpdateRecord(id, { timestamp, type, notes });
                } else {
                    success = await Store.adminAddRecord(userId, userName, timestamp, type, notes);
                }

                if (success) {
                    Store.showToast(id ? 'Registro actualizado' : 'Registro añadido', 'success');
                    recordFormContainer.style.display = 'none';
                    btnAddRecord.style.display = 'block';
                    await this.updateSummaryStats();
                    await this.renderGlobalRecords(globalTargetMonth);
                    await this.renderUsers(targetMonth); 
                }
            });
        }

        if (globalMonthFilter && availableMonths.length > 0) {
            globalMonthFilter.innerHTML = availableMonths.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
            globalMonthFilter.addEventListener('change', async (e) => {
                globalTargetMonth = e.target.value;
                await this.renderGlobalRecords(globalTargetMonth);
            });
        }
        
        await this.renderGlobalRecords(globalTargetMonth);
    },

    async updateSummaryStats() {
        const statsToday = document.getElementById('stats-today');
        const statsActive = document.getElementById('stats-active');

        if (!statsToday || !statsActive) return;

        // Fetch all profiles to find total employees
        const profiles = await Store.adminGetAllUsers();
        const employees = profiles.filter(p => p.role === 'employee');

        // Fetch all records for today
        const today = new Date().toISOString().split('T')[0];
        const { data: todayRecords } = await supabaseClient
            .from('time_records')
            .select('*')
            .gte('timestamp', `${today}T00:00:00Z`)
            .lte('timestamp', `${today}T23:59:59Z`);

        statsToday.textContent = todayRecords ? todayRecords.length : 0;

        // Count active workers (last record is IN)
        let activeCount = 0;
        for (const emp of employees) {
            const status = await Store.getEmployeeStatus(emp.id);
            if (status === 'IN') activeCount++;
        }
        statsActive.textContent = activeCount;
    },

    async renderGlobalRecords(monthStr = null) {
        const tbody = document.querySelector('#global-records tbody');
        if (!tbody) return;

        const records = await Store.getRecords({ month: monthStr });

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-secondary">Sin registros.</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(r => {
            const rDate = new Date(r.timestamp);
            return `
            <tr>
                <td style="font-weight: 500; color: var(--primary);">${r.user_name}</td>
                <td style="font-family: monospace;">${rDate.toLocaleString('es-ES')}</td>
                <td><span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type === 'IN' ? 'ENTRADA' : 'SALIDA'}</span></td>
                <td style="font-size: 0.85rem; color: var(--text-secondary); max-width: 150px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${r.notes || ''}">${r.notes ? r.notes : '<span style="opacity:0.3">-</span>'}</td>
                <td style="text-align: right;">
                    <button class="btn-edit-record" 
                            data-id="${r.id}" 
                            data-user-id="${r.user_id}" 
                            data-user-name="${r.user_name}"
                            data-timestamp="${r.timestamp}" 
                            data-type="${r.type}" 
                            data-notes="${r.notes || ''}"
                            style="background: none; border: none; cursor: pointer; color: var(--primary); padding: 0.25rem;">✏️</button>
                </td>
            </tr>
            `;
        }).join('');

        document.querySelectorAll('.btn-edit-record').forEach(btn => {
            btn.onclick = async (e) => {
                const users = await Store.adminGetAllUsers();
                const rfUserSelect = document.getElementById('rf-user-id');
                rfUserSelect.innerHTML = users.map(u => `<option value="${u.id}" data-name="${u.full_name}">${u.full_name}</option>`).join('');

                const id = btn.getAttribute('data-id');
                const userId = btn.getAttribute('data-user-id');
                const timestamp = btn.getAttribute('data-timestamp');
                const type = btn.getAttribute('data-type');
                const notes = btn.getAttribute('data-notes');

                document.getElementById('rf-id').value = id;
                document.getElementById('rf-user-id').value = userId;
                const date = new Date(timestamp);
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                document.getElementById('rf-timestamp').value = date.toISOString().slice(0, 16);
                document.getElementById('rf-type').value = type;
                document.getElementById('rf-notes').value = notes;

                document.getElementById('record-form-title').textContent = 'Corregir Registro';
                document.getElementById('record-form-container').style.display = 'block';
                document.getElementById('btn-add-manual-record').style.display = 'none';
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            };
        });
    },

    async renderUsers(monthStr = null) {
        if (!monthStr) {
            const mList = Store.getAvailableMonths(await Store.getRecords());
            if (mList.length > 0) monthStr = mList[0];
        }

        const users = await Store.adminGetAllUsers();
        const tbody = document.querySelector('#users-table tbody');
        if (!tbody) return;
        
        const userRows = await Promise.all(users.map(async u => {
            const hours = await Store.calculateMonthlyHours(u.id, monthStr);
            const periodRecords = await Store.getRecords({ userId: u.id, month: monthStr });
            
            const isEmployeeSigned = periodRecords.length > 0 && periodRecords.every(r => r.is_validated);
            const isCompanySigned = periodRecords.length > 0 && periodRecords.every(r => r.is_company_validated);

            return `
                <tr>
                    <td style="font-weight: 500;">${u.full_name}</td>
                    <td style="font-family: monospace; font-weight: 700; color: var(--text-primary);">${Store.formatTime(hours)}</td>
                    <td>
                        <span class="badge ${isEmployeeSigned ? 'badge-active' : 'badge-inactive'}" style="font-size: 0.75rem;">
                            ${isEmployeeSigned ? 'Validado' : (periodRecords.length > 0 ? 'Pendiente' : 'SIN DATOS')}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${isCompanySigned ? 'badge-info' : 'badge-inactive'}" style="font-size: 0.75rem;">
                            ${isCompanySigned ? 'Validado' : (periodRecords.length > 0 ? 'Pendiente' : 'SIN DATOS')}
                        </span>
                    </td>
                    <td style="text-align: right; display: flex; justify-content: flex-end; gap: 0.5rem; align-items: center;">
                        <button class="btn-edit-user" 
                                data-id="${u.id}" 
                                data-name="${u.full_name}" 
                                data-role="${u.role}" 
                                style="background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.25rem;" 
                                title="Editar datos">✏️</button>
                        
                        ${isEmployeeSigned && !isCompanySigned ? 
                            `<button class="btn btn-company-sign" data-id="${u.id}" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; background: #6366F1; color: white;">✍️ Firma Empresa</button>` : ''
                        }
                        <button class="btn btn-export-user" data-id="${u.id}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; background: var(--primary); color: white; border: none;" title="CSV de este mes">⬇️ Reporte</button>
                    </td>
                </tr>
            `;
        }));

        tbody.innerHTML = userRows.join('');

        document.querySelectorAll('.btn-company-sign').forEach(btn => {
            btn.onclick = async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const filter = document.getElementById('employer-month-filter');
                const tMonth = filter ? filter.value : null;
                
                if (confirm(`¿Confirma la correcta validación de los registros de este mes para este empleado?`)) {
                    const success = await Store.companyValidateMonth(id, tMonth);
                    if (success) {
                        Store.showToast('Mes firmado por la Empresa', 'success');
                        await this.renderUsers(tMonth);
                    }
                }
            };
        });

        document.querySelectorAll('.btn-edit-user').forEach(btn => {
            btn.onclick = (e) => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                const role = btn.getAttribute('data-role');
                
                document.getElementById('nu-id').value = id;
                document.getElementById('nu-name').value = name;
                document.getElementById('nu-role').value = role;
                
                document.getElementById('nu-username').parentElement.style.display = 'none';
                document.getElementById('nu-password').parentElement.style.display = 'none';
                
                document.getElementById('new-user-title').textContent = 'Editar Usuario';
                document.getElementById('new-user-form-container').style.display = 'block';
                document.getElementById('btn-toggle-new-user').style.display = 'none';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        });

        document.querySelectorAll('.btn-export-user').forEach(btn => {
            btn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = e.currentTarget.getAttribute('data-id');
                const filter = document.getElementById('employer-month-filter');
                const tMonth = filter ? filter.value : 'ALL';
                await Store.exportEmployeeCSV(id, tMonth);
                return false;
            };
        });
    }
};
