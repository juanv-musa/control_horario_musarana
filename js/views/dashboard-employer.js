import { Store } from '../store.js?v=999';
import { Router } from '../router.js?v=999';

export const EmployerDashboard = {
    render() {
        const user = Store.getUser();
        if (!user) return '';

        return `
            <div style="width: 100%; min-height: 100vh; background: var(--bg-page);">
                <nav class="navbar">
                    <div class="nav-brand"><img src="assets/logo.png" alt="MUSARAÑA" style="height: 48px;"></div>
                    <div class="user-info">
                        <a href="#/manual" class="btn btn-secondary" style="background: #EEF2FF; color: #6366F1; border: none; font-size: 0.85rem; padding: 0.5rem 1rem;">📖 Manual</a>
                        <span class="user-role">Musaraña</span>
                        <span style="font-weight: 600; color: var(--text-primary);">${user.full_name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container mt-4">
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

                    <div class="glass-panel" style="padding: 1.25rem; margin-bottom: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                            <h2 style="margin: 0; font-size: 1.4rem;">👥 Gestión de Personal</h2>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                                <select id="employer-month-filter" class="form-control" style="width: auto; background: white; font-size: 0.9rem; padding: 0.5rem 2rem 0.5rem 0.75rem;">
                                    <!-- Filled dynamically -->
                                </select>
                                <button class="btn" id="btn-toggle-new-user" style="background: var(--primary); color: white; padding: 0.5rem 1rem; height: 38px; border: none; border-radius: var(--radius-sm); font-weight: 600;">+ Añadir Empleado</button>
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
                                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                                    <button type="submit" class="btn btn-primary" id="nu-submit">Guardar Usuario</button>
                                    <button type="button" class="btn" id="btn-cancel-new-user" style="background: white; border: 1px solid var(--border);">Cancelar</button>
                                    <button type="button" class="btn" id="btn-delete-user" style="background: var(--danger); color: white; display: none; margin-left: auto;" title="Eliminar usuario">Dar de Baja</button>
                                </div>
                            </form>
                        </div>

                        <div class="table-container">
                            <table class="table" id="users-table" style="font-size: 0.9rem;">
                                <thead>
                                    <tr>
                                        <th>Nombre Completo</th>
                                        <th>Horas</th>
                                        <th>Firma Emp.</th>
                                        <th>Firma Cía.</th>
                                        <th style="text-align: right;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Filled dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 1.25rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                            <h2 style="margin: 0; font-size: 1.4rem;">📅 Registro Global</h2>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                                <select id="employer-global-month-filter" class="form-control" style="width: auto; background: white; font-size: 0.9rem; padding: 0.5rem 2rem 0.5rem 0.75rem;">
                                    <!-- Filled dynamically -->
                                </select>
                                <button class="btn" id="btn-add-manual-record" style="background: var(--text-primary); color: white; padding: 0.5rem 1rem; height: 38px; border: none; border-radius: var(--radius-sm); font-weight: 600;">+ Añadir Olvido</button>
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
                                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                                    <button type="submit" class="btn btn-primary" style="background: #4F46E5;">Guardar Cambios</button>
                                    <button type="button" class="btn" id="btn-cancel-record" style="background: white; border: 1px solid var(--border);">Cancelar</button>
                                    <button type="button" class="btn" id="btn-delete-record" style="background: var(--danger); color: white; display: none; margin-left: auto;">Eliminar</button>
                                </div>
                            </form>
                        </div>

                        <div class="table-container">
                            <table class="table" id="global-records" style="font-size: 0.85rem;">
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th>Fecha/Hora</th>
                                        <th>Acción</th>
                                        <th>Notas</th>
                                        <th style="text-align: right;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Filled dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 1.25rem; margin-bottom: 2rem;" id="panel-vacaciones">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
                            <h2 style="margin:0; font-size: 1.4rem;">🏖️ Vacaciones</h2>
                            <button class="btn" id="btn-new-absence" style="background:#F59E0B; border:none; color:white; padding: 0.5rem 1.25rem; border-radius: var(--radius-sm); font-weight: 700;">+ Registrar</button>
                        </div>

                        <div id="absence-form-container" style="display:none;padding:1.5rem;background:#FFFBEB;border-radius:var(--radius-md);margin-bottom:1.5rem;border:1px solid #F59E0B;">
                            <h4 id="absence-form-title">Nueva Ausencia</h4>
                            <form id="absence-form" style="margin-top:1rem;">
                                <input type="hidden" id="ab-id">
                                <div class="responsive-grid">
                                    <div class="form-group" style="margin-bottom:0;">
                                        <label class="form-label">Empleado</label>
                                        <select id="ab-user" class="form-control" required></select>
                                    </div>
                                    <div class="form-group" style="margin-bottom:0;">
                                        <label class="form-label">Tipo</label>
                                        <select id="ab-type" class="form-control" required>
                                            <option value="vacation">🏖️ Vacaciones</option>
                                            <option value="sick_leave">🤒 Baja Médica</option>
                                            <option value="personal">🧾 Asunto Personal</option>
                                            <option value="other">📋 Otro</option>
                                        </select>
                                    </div>
                                    <div class="form-group" style="margin-bottom:0;">
                                        <label class="form-label">Fecha Inicio</label>
                                        <input type="date" id="ab-start" class="form-control" required>
                                    </div>
                                    <div class="form-group" style="margin-bottom:0;">
                                        <label class="form-label">Fecha Fin</label>
                                        <input type="date" id="ab-end" class="form-control" required>
                                    </div>
                                    <div class="form-group" style="margin-bottom:0;">
                                        <label class="form-label">Estado</label>
                                        <select id="ab-status" class="form-control">
                                            <option value="approved">✅ Aprobada</option>
                                            <option value="pending">⏳ Pendiente</option>
                                            <option value="denied">❌ Denegada</option>
                                        </select>
                                    </div>
                                    <div class="form-group" style="margin-bottom:0;">
                                        <label class="form-label">Observaciones</label>
                                        <input type="text" id="ab-notes" class="form-control" placeholder="Opcional...">
                                    </div>
                                </div>
                                <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
                                    <button type="submit" class="btn btn-primary">Guardar</button>
                                    <button type="button" id="btn-cancel-absence" class="btn" style="background:white;border:1px solid var(--border);">Cancelar</button>
                                    <button type="button" id="btn-delete-absence" class="btn" style="background:var(--danger);color:white;display:none;margin-left:auto;">Eliminar</button>
                                </div>
                            </form>
                        </div>

                        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.5rem;">
                            <select id="ab-filter-user" class="form-control" style="width:auto; min-width: 160px; background:white; font-size: 0.85rem; padding: 0.4rem 2rem 0.4rem 0.75rem;"></select>
                            <select id="ab-filter-status" class="form-control" style="width:auto; min-width: 150px; background:white; font-size: 0.85rem; padding: 0.4rem 2rem 0.4rem 0.75rem;">
                                <option value="ALL">Todos los estados</option>
                                <option value="pending">⏳ Pendiente</option>
                                <option value="approved">✅ Aprobada</option>
                                <option value="denied">❌ Denegada</option>
                            </select>
                        </div>

                        <div class="table-container">
                            <table class="table" id="absences-table">
                                <thead><tr>
                                    <th>Empleado</th><th>Tipo</th><th>Inicio</th><th>Fin</th>
                                    <th>Días</th><th>Estado</th><th style="text-align:right;">Acciones</th>
                                </tr></thead>
                                <tbody><tr><td colspan="7" class="text-center text-secondary">Cargando...</td></tr></tbody>
                            </table>
                        </div>

                        <div style="margin-top:2rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
                                <h3 style="margin:0; font-size: 1.2rem;">📊 Control de Cuotas</h3>
                                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                                    <label style="font-size:0.75rem; color:var(--text-secondary); font-weight: 600; text-transform: uppercase;">Días Base:</label>
                                    <input type="number" id="global-vacation-days" class="form-control" value="22" min="1" max="31" style="width:65px; height: 35px; text-align: center;">
                                    <button id="btn-apply-global-days" class="btn btn-primary" style="padding:0.4rem 0.8rem; font-size:0.8rem; height: 35px;">Aplicar</button>
                                </div>
                            </div>
                            <div class="table-container">
                                <table class="table" id="allowances-table">
                                    <thead><tr>
                                        <th>Empleado</th><th>Total Asignado</th><th>Días Usados</th><th>Disponibles</th><th style="min-width:150px;">Progreso</th>
                                    </tr></thead>
                                    <tbody><tr><td colspan="5" class="text-center text-secondary">Cargando...</td></tr></tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 1.25rem; margin-bottom: 2rem; border-left: 5px solid var(--danger);">
                        <h2 style="margin: 0; color: #991B1B; font-size: 1.3rem;">🔐 Acceso Auditoría</h2>
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
                
                const btnDeleteUser = document.getElementById('btn-delete-user');
                if (btnDeleteUser) btnDeleteUser.style.display = 'none';
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

        const btnDeleteUser = document.getElementById('btn-delete-user');
        if (btnDeleteUser) {
            btnDeleteUser.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = document.getElementById('nu-id').value;
                if (!id) return;
                
                if (confirm('¿Estás seguro de que deseas dar de baja y eliminar a este empleado de MUSARAÑA? Esta acción eliminará su perfil permanentemente.')) {
                    const submitBtn = document.getElementById('nu-submit');
                    if (submitBtn) submitBtn.disabled = true;
                    btnDeleteUser.disabled = true;
                    btnDeleteUser.style.opacity = '0.5';
                    
                    const res = await Store.adminDeleteUser(id);
                    if (res.success) {
                        Store.showToast('Empleado dado de baja con éxito', 'success');
                        formContainer.style.display = 'none';
                        toggleBtn.style.display = 'block';
                        await this.updateSummaryStats();
                        await this.renderUsers(targetMonth);
                    } else {
                        Store.showToast(res.error, 'error');
                        if (submitBtn) submitBtn.disabled = false;
                        btnDeleteUser.disabled = false;
                        btnDeleteUser.style.opacity = '1';
                    }
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
                document.getElementById('btn-delete-record').style.display = 'none';
                
                const submitBtn = recordForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                
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

        const btnDeleteRecord = document.getElementById('btn-delete-record');
        if (btnDeleteRecord) {
            btnDeleteRecord.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = document.getElementById('rf-id').value;
                if (!id) return;
                
                if (confirm('¿Estás seguro de que deseas eliminar este registro por completo? Esta acción no se puede deshacer.')) {
                    const submitBtn = recordForm.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    btnDeleteRecord.disabled = true;
                    
                    const success = await Store.adminDeleteRecord(id);
                    if (success) {
                        Store.showToast('Registro eliminado', 'success');
                        recordFormContainer.style.display = 'none';
                        btnAddRecord.style.display = 'block';
                        await this.updateSummaryStats();
                        await this.renderGlobalRecords(globalTargetMonth);
                        await this.renderUsers(targetMonth);
                    } else {
                        Store.showToast("Error al intentar borrar. Revisa la consola.", "error");
                    }
                    
                    submitBtn.disabled = false;
                    btnDeleteRecord.disabled = false;
                }
            });
        }

        if (recordForm) {
            recordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = e.target.querySelector('button[type="submit"]');
                submitBtn.disabled = true;

                const id = document.getElementById('rf-id').value;
                const userId = document.getElementById('rf-user-id').value;
                const opt = rfUserSelect.options[rfUserSelect.selectedIndex];
                const userName = opt.getAttribute('data-name');
                const timestampInput = document.getElementById('rf-timestamp').value;
                const [datePart, timePart] = timestampInput.split('T');
                const [year, month, day] = datePart.split('-');
                const [hours, minutes] = timePart.split(':');
                const localDate = new Date(year, month - 1, day, hours, minutes);
                const timestamp = localDate.toISOString();
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
                submitBtn.disabled = false;
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
        await this.initVacations();
    },

    async updateSummaryStats() {
        const statsToday = document.getElementById('stats-today');
        const statsActive = document.getElementById('stats-active');

        if (!statsToday || !statsActive) return;

        const { todayRecords, activeCount } = await Store.getDashboardStats();
        
        statsToday.textContent = todayRecords;
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
                <td data-label="Empleado" style="font-weight: 500; color: var(--primary);">${r.user_name}</td>
                <td data-label="Fecha/Hora" style="font-family: monospace;">${rDate.toLocaleString('es-ES')}</td>
                <td data-label="Acción"><span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type === 'IN' ? 'ENTRADA' : 'SALIDA'}</span></td>
                <td data-label="Notas" style="font-size: 0.85rem; color: var(--text-secondary); max-width: 150px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${r.notes || ''}">${r.notes ? r.notes : '<span style="opacity:0.3">-</span>'}</td>
                <td data-label="Acciones" style="text-align: right;">
                    <div style="display: flex; justify-content: flex-end; gap: 0.5rem; align-items: center;">
                        <button class="btn-edit-record" 
                                data-id="${r.id}" 
                                data-user-id="${r.user_id}" 
                                data-user-name="${r.user_name}"
                                data-timestamp="${r.timestamp}" 
                                data-type="${r.type}" 
                                data-notes="${r.notes || ''}"
                                style="background: none; border: none; cursor: pointer; color: var(--primary); padding: 0.25rem;" title="Corregir registro">✏️</button>
                        <button class="btn-delete-record-direct" 
                                data-id="${r.id}"
                                style="background: none; border: none; cursor: pointer; color: var(--danger); padding: 0.25rem;" title="Eliminar registro">🗑️</button>
                    </div>
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
                document.getElementById('btn-delete-record').style.display = 'block';
                
                const submitBtn = document.getElementById('record-form').querySelector('button[type="submit"]');
                submitBtn.disabled = false;

                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            };
        });

        document.querySelectorAll('.btn-delete-record-direct').forEach(btn => {
            btn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (confirm('¿Estás seguro de que deseas eliminar este registro por completo? Esta acción no se puede deshacer.')) {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    const success = await Store.adminDeleteRecord(id);
                    if (success) {
                        Store.showToast('Registro eliminado', 'success');
                        await this.updateSummaryStats();
                        const globalMonthFilter = document.getElementById('employer-global-month-filter');
                        const globalTargetMonth = globalMonthFilter ? globalMonthFilter.value : null;
                        
                        const targetMonthFilter = document.getElementById('employer-month-filter');
                        const targetMonth = targetMonthFilter ? targetMonthFilter.value : null;
                        
                        await this.renderGlobalRecords(globalTargetMonth);
                        await this.renderUsers(targetMonth);
                    } else {
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        Store.showToast('Error al eliminar registro', 'error');
                    }
                }
            };
        });
    },

    async renderUsers(monthStr = null) {
        if (!monthStr) {
            const mList = Store.getAvailableMonths(await Store.getRecords());
            if (mList.length > 0) monthStr = mList[0];
        }

        const users = await Store.adminGetAllUsers();
        // FILTRO: Solo empleados
        const employees = users.filter(u => u.role === 'employee');
        const tbody = document.querySelector('#users-table tbody');
        if (!tbody) return;
        
        const userRows = await Promise.all(employees.map(async u => {
            const hours = await Store.calculateMonthlyHours(u.id, monthStr);
            const periodRecords = await Store.getRecords({ userId: u.id, month: monthStr });
            
            const isEmployeeSigned = periodRecords.length > 0 && periodRecords.every(r => r.is_validated);
            const isCompanySigned = periodRecords.length > 0 && periodRecords.every(r => r.is_company_validated);

            return `
                <tr>
                    <td data-label="Nombre Completo" style="font-weight: 500;">${u.full_name}</td>
                    <td data-label="Horas" style="font-family: monospace; font-weight: 700; color: var(--text-primary);">${Store.formatTime(hours)}</td>
                    <td data-label="Firma Emp.">
                        <span class="badge ${isEmployeeSigned ? 'badge-active' : 'badge-inactive'}" style="font-size: 0.75rem;">
                            ${isEmployeeSigned ? 'Validado' : (periodRecords.length > 0 ? 'Pendiente' : 'SIN DATOS')}
                        </span>
                    </td>
                    <td data-label="Firma Cía.">
                        <span class="badge ${isCompanySigned ? 'badge-info' : 'badge-inactive'}" style="font-size: 0.75rem;">
                            ${isCompanySigned ? 'Validado' : (periodRecords.length > 0 ? 'Pendiente' : 'SIN DATOS')}
                        </span>
                    </td>
                    <td data-label="Acciones" style="text-align: right;">
                        <div class="btn-group-responsive" style="display: flex; justify-content: flex-end; gap: 0.5rem; align-items: center;">
                            <button class="btn-edit-user" 
                                    data-id="${u.id}" 
                                    data-name="${u.full_name}" 
                                    data-role="${u.role}" 
                                    style="background: none; border: none; cursor: pointer; color: var(--text-secondary); padding: 0.25rem;" 
                                    title="Editar datos">✏️</button>
                            
                            ${isEmployeeSigned && !isCompanySigned ? 
                                `<button class="btn btn-company-sign" data-id="${u.id}" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; background: #6366F1; color: white; border-radius: 6px; border:none;">✍️ Firma Empresa</button>` : ''
                            }
                            <button class="btn btn-export-user" data-id="${u.id}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; background: var(--primary); color: white; border: none; border-radius: 6px;" title="CSV de este mes">📄 CSV</button>
                            <button class="btn btn-export-pdf" data-id="${u.id}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; background: #6366F1; color: white; border: none; border-radius: 6px;" title="PDF de este mes">📋 PDF</button>
                        </div>
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
                
                const btnDeleteUser = document.getElementById('btn-delete-user');
                if (btnDeleteUser) btnDeleteUser.style.display = 'block';
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        });

        document.querySelectorAll('.btn-export-user').forEach(btn => {
            btn.onclick = async (e) => {
                e.preventDefault(); e.stopPropagation();
                const id = e.currentTarget.getAttribute('data-id');
                const filter = document.getElementById('employer-month-filter');
                await Store.exportEmployeeCSV(id, filter ? filter.value : 'ALL');
            };
        });

        document.querySelectorAll('.btn-export-pdf').forEach(btn => {
            btn.onclick = async (e) => {
                e.preventDefault(); e.stopPropagation();
                const id = e.currentTarget.getAttribute('data-id');
                const filter = document.getElementById('employer-month-filter');
                await Store.exportEmployeePDF(id, filter ? filter.value : 'ALL');
            };
        });
    },

    async initVacations() {
        const users = await Store.adminGetAllUsers();
        const employees = users.filter(u => u.role === 'employee');

        const abUserSel = document.getElementById('ab-user');
        if (abUserSel) abUserSel.innerHTML = employees.map(u => `<option value="${u.id}">${u.full_name}</option>`).join('');

        const abFilterUser = document.getElementById('ab-filter-user');
        if (abFilterUser) {
            abFilterUser.innerHTML = '<option value="ALL">Todos los empleados</option>' + employees.map(u => `<option value="${u.id}">${u.full_name}</option>`).join('');
        }

        const getFilters = () => ({
            userId: document.getElementById('ab-filter-user')?.value || 'ALL',
            status: document.getElementById('ab-filter-status')?.value || 'ALL'
        });

        document.getElementById('ab-filter-user')?.addEventListener('change', () => this.renderAbsences(getFilters(), employees));
        document.getElementById('ab-filter-status')?.addEventListener('change', () => this.renderAbsences(getFilters(), employees));

        document.getElementById('btn-new-absence')?.addEventListener('click', () => {
            document.getElementById('absence-form').reset();
            document.getElementById('ab-id').value = '';
            document.getElementById('absence-form-title').textContent = 'Nueva Ausencia';
            document.getElementById('btn-delete-absence').style.display = 'none';
            document.getElementById('absence-form-container').style.display = 'block';
            document.getElementById('btn-new-absence').style.display = 'none';
        });

        document.getElementById('btn-cancel-absence')?.addEventListener('click', () => {
            document.getElementById('absence-form-container').style.display = 'none';
            document.getElementById('btn-new-absence').style.display = 'block';
        });

        document.getElementById('btn-delete-absence')?.addEventListener('click', async () => {
            const id = document.getElementById('ab-id').value;
            if (!id) return;
            if (confirm('¿Eliminar esta ausencia?')) {
                const ok = await Store.deleteAbsence(id);
                if (ok) {
                    Store.showToast('Ausencia eliminada', 'success');
                    document.getElementById('absence-form-container').style.display = 'none';
                    document.getElementById('btn-new-absence').style.display = 'block';
                    await this.renderAbsences(getFilters(), employees);
                    await this.renderVacationAllowances(employees);
                }
            }
        });

        document.getElementById('absence-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('ab-id').value;
            const ok = await Store.saveAbsence({
                id: id || null,
                user_id: document.getElementById('ab-user').value,
                type: document.getElementById('ab-type').value,
                start_date: document.getElementById('ab-start').value,
                end_date: document.getElementById('ab-end').value,
                status: document.getElementById('ab-status').value,
                notes: document.getElementById('ab-notes').value,
                requested_by_employee: false
            });
            if (ok) {
                Store.showToast(id ? 'Ausencia actualizada' : 'Ausencia registrada', 'success');
                document.getElementById('absence-form-container').style.display = 'none';
                document.getElementById('btn-new-absence').style.display = 'block';
                document.getElementById('absence-form').reset();
                await this.renderAbsences(getFilters(), employees);
                await this.renderVacationAllowances(employees);
            } else {
                Store.showToast('Error al guardar la ausencia', 'error');
            }
        });

        document.getElementById('btn-apply-global-days')?.addEventListener('click', async () => {
            const days = parseInt(document.getElementById('global-vacation-days').value);
            if (!days || days < 1) return Store.showToast('Número de días inválido', 'error');
            if (!confirm(`¿Aplicar ${days} días a todos los empleados sin asignación personalizada?`)) return;
            for (const emp of employees) {
                await Store.updateAllowance(emp.id, days);
            }
            Store.showToast('Días actualizados para todos los empleados', 'success');
            await this.renderVacationAllowances(employees);
        });

        await this.renderAbsences(getFilters(), employees);
        await this.renderVacationAllowances(employees);
    },

    async renderAbsences(filters = {}, employees = []) {
        const tbody = document.querySelector('#absences-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="loader-sm" style="display:inline-block"></div></td></tr>';
        const absences = await Store.getAbsences(filters);
        if (absences.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-secondary">No hay ausencias registradas.</td></tr>';
            return;
        }
        const typeLabels = { vacation: '🏖️ Vacaciones', sick_leave: '🤒 Baja Médica', personal: '🧾 Asunto Personal', other: '📋 Otro' };
        const statusConfig = { pending: { label: 'Pendiente', color: '#92400E', bg: '#FEF3C7' }, approved: { label: 'Aprobada', color: '#065F46', bg: '#D1FAE5' }, denied: { label: 'Denegada', color: '#991B1B', bg: '#FEE2E2' } };
        tbody.innerHTML = absences.map(a => {
            const empName = a.profiles?.full_name || employees.find(u => u.id === a.user_id)?.full_name || a.user_id;
            const sc = statusConfig[a.status] || statusConfig.pending;
            const badge = `<span style="background:${sc.bg};color:${sc.color};padding:2px 10px;border-radius:999px;font-size:0.75rem;font-weight:700;">${sc.label}</span>`;
            return `<tr>
                <td data-label="Empleado" style="font-weight:500;">${empName}</td>
                <td data-label="Tipo">${typeLabels[a.type] || a.type}</td>
                <td data-label="Inicio" style="font-family:monospace;">${a.start_date}</td>
                <td data-label="Fin" style="font-family:monospace;">${a.end_date}</td>
                <td data-label="Días"><strong>${a.working_days || 0}</strong> días</td>
                <td data-label="Estado">${badge}</td>
                <td data-label="Acciones" style="text-align:right;">
                    <div class="btn-group-responsive" style="justify-content:flex-end;">
                        ${a.status !== 'approved' ? `<button class="btn-ab-approve" data-id="${a.id}" style="background:#D1FAE5;color:#065F46;border:none;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:0.75rem;font-weight:700;">Aprobar</button>` : ''}
                        ${a.status !== 'denied' ? `<button class="btn-ab-deny" data-id="${a.id}" style="background:#FEE2E2;color:#991B1B;border:none;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:0.75rem;font-weight:700;">Denegar</button>` : ''}
                        <button class="btn-ab-edit" data-id="${a.id}" data-user="${a.user_id}" data-type="${a.type}" data-start="${a.start_date}" data-end="${a.end_date}" data-status="${a.status}" data-notes="${a.notes || ''}" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:3px;">✏️</button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        document.querySelectorAll('.btn-ab-approve').forEach(btn => {
            btn.onclick = async () => {
                const ok = await Store.updateAbsenceStatus(btn.dataset.id, 'approved');
                if (ok) { Store.showToast('Ausencia aprobada', 'success'); await this.renderAbsences(filters, employees); await this.renderVacationAllowances(employees); }
            };
        });
        document.querySelectorAll('.btn-ab-deny').forEach(btn => {
            btn.onclick = async () => {
                const ok = await Store.updateAbsenceStatus(btn.dataset.id, 'denied');
                if (ok) { Store.showToast('Ausencia denegada', 'success'); await this.renderAbsences(filters, employees); await this.renderVacationAllowances(employees); }
            };
        });
        document.querySelectorAll('.btn-ab-edit').forEach(btn => {
            btn.onclick = () => {
                const d = btn.dataset;
                document.getElementById('ab-id').value = d.id;
                document.getElementById('ab-user').value = d.user;
                document.getElementById('ab-type').value = d.type;
                document.getElementById('ab-start').value = d.start;
                document.getElementById('ab-end').value = d.end;
                document.getElementById('ab-status').value = d.status;
                document.getElementById('ab-notes').value = d.notes;
                document.getElementById('absence-form-title').textContent = 'Editar Ausencia';
                document.getElementById('btn-delete-absence').style.display = 'block';
                document.getElementById('absence-form-container').style.display = 'block';
                document.getElementById('btn-new-absence').style.display = 'none';
                document.getElementById('panel-vacaciones').scrollIntoView({ behavior: 'smooth' });
            };
        });
    },

    async renderVacationAllowances(employees = []) {
        const tbody = document.querySelector('#allowances-table tbody');
        if (!tbody) return;
        const year = new Date().getFullYear();
        tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="loader-sm" style="display:inline-block"></div></td></tr>';
        const rows = await Promise.all(employees.filter(u => u.role === 'employee').map(async u => {
            const allowance = await Store.getOrCreateAllowance(u.id);
            const total = allowance?.total_days ?? Store.DEFAULT_VACATION_DAYS;
            const used = await Store.getUsedVacationDays(u.id, year);
            const avail = Math.max(0, total - used);
            const pct = Math.min(100, Math.round((used / total) * 100));
            const barColor = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#10B981';
            return `<tr>
                <td data-label="Empleado" style="font-weight:500;">${u.full_name}</td>
                <td data-label="Total Asignado" style="text-align:center;">
                    <div style="display:flex;align-items:center;gap:0.5rem;justify-content:center;">
                        <strong>${total}</strong>
                        <button class="btn-edit-allowance" data-id="${u.id}" data-current="${total}" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px;">✏️</button>
                    </div>
                </td>
                <td data-label="Días Usados" style="text-align:center;"><strong style="color:#EF4444;">${used}</strong></td>
                <td data-label="Disponibles" style="text-align:center;"><strong style="color:#10B981;">${avail}</strong></td>
                <td data-label="Progreso">
                    <div style="background:#e5e7eb;border-radius:999px;height:10px;overflow:hidden;">
                        <div style="background:${barColor};height:100%;width:${pct}%;border-radius:999px;transition:width 0.5s ease;"></div>
                    </div>
                    <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:2px;text-align:center;">${pct}% usado</div>
                </td>
            </tr>`;
        }));
        tbody.innerHTML = rows.join('');
        document.querySelectorAll('.btn-edit-allowance').forEach(btn => {
            btn.onclick = async () => {
                const newVal = prompt(`Días de vacaciones para este empleado (actual: ${btn.dataset.current}):`, btn.dataset.current);
                if (!newVal || isNaN(newVal) || parseInt(newVal) < 1) return;
                const ok = await Store.updateAllowance(btn.dataset.id, parseInt(newVal));
                if (ok) { Store.showToast('Días actualizados', 'success'); await this.renderVacationAllowances(employees); }
            };
        });
    }
};
