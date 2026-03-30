import { Store } from '../store.js';
import { Router } from '../router.js';

export const EmployerDashboard = {
    render() {
        const user = Store.getUser();
        if (!user) return '';

        return `
            <div style="width: 100%;">
                <nav class="navbar">
                    <div class="nav-brand"><img src="assets/logo.png" alt="MUSARANA" style="height: 48px;"></div>
                    <div class="user-info">
                        <span class="user-role">Musarana</span>
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
                            <form id="new-user-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
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
                                <div style="grid-column: 1 / -1; margin-top: 1rem;">
                                    <button type="submit" class="btn btn-primary" id="nu-submit">Guardar Usuario</button>
                                    <button type="button" class="btn" id="btn-cancel-new-user" style="margin-left: 0.5rem; background: white; border: 1px solid var(--border);">Cancelar</button>
                                </div>
                            </form>
                        </div>

                        <div class="table-container">
                            <table class="table" id="users-table">
                                <thead>
                                    <tr>
                                        <th>Nombre Completo</th>
                                        <th>Horas (Periodo)</th>
                                        <th>Estado Firma</th>
                                        <th>Rol</th>
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
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                            <h2 style="margin: 0;">Registro Global de Jornada</h2>
                            <select id="employer-global-month-filter" class="form-control" style="width: auto; background: white;">
                                <!-- Filled dynamically -->
                            </select>
                        </div>
                        <div class="table-container">
                            <table class="table" id="global-records">
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th>Fecha/Hora</th>
                                        <th>Acción</th>
                                        <th>Observaciones</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Filled dynamically -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 2rem; margin-top: 1.5rem;">
                        <h3 class="mb-4">⚙️ Configuración de Perfil</h3>
                        <form id="profile-form" style="max-width: 500px;">
                            <div class="form-group">
                                <label class="form-label">Nombre para Mostrar</label>
                                <input type="text" id="profile-name" class="form-control" value="${user.full_name}" required>
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
        `;
    },

    async init() {
        const user = Store.getUser();
        const records = await Store.getRecords();
        const availableMonths = Store.getAvailableMonths(records);

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
                    await this.renderUsers();
                } else {
                    Store.showToast(res.error, 'error');
                }
            });
        }

        // Initialize Global Records
        const globalMonthFilter = document.getElementById('employer-global-month-filter');
        let globalTargetMonth = availableMonths[0]; 
        
        if (globalMonthFilter && availableMonths.length > 0) {
            globalMonthFilter.innerHTML = availableMonths.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
            globalMonthFilter.addEventListener('change', async (e) => {
                globalTargetMonth = e.target.value;
                await this.renderGlobalRecords(globalTargetMonth);
            });
        }
        
        await this.renderGlobalRecords(globalTargetMonth);
    },

    async renderGlobalRecords(monthStr = null) {
        const tbody = document.querySelector('#global-records tbody');
        if (!tbody) return;

        const records = await Store.getRecords({ month: monthStr });
        const allRecords = await Store.getRecords(); // For stats

        // Metrics
        let todayCount = 0;
        let activeCount = 0;
        const usersInStatus = new Set();
        const today = new Date().toDateString();

        // Use all records to compute global stats correctly
        const lastActionPerUser = {};
        allRecords.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)).forEach(r => {
            const rDate = new Date(r.timestamp);
            if (rDate.toDateString() === today) todayCount++;
            lastActionPerUser[r.user_id] = r.type;
        });
        
        Object.values(lastActionPerUser).forEach(type => {
            if (type === 'IN') activeCount++;
        });

        const statToday = document.getElementById('stats-today');
        const statActive = document.getElementById('stats-active');
        if (statToday) statToday.textContent = todayCount;
        if (statActive) statActive.textContent = activeCount;

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-secondary">Sin registros.</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(r => {
            const rDate = new Date(r.timestamp);
            return `
            <tr>
                <td style="font-weight: 500; color: var(--primary);">${r.user_name}</td>
                <td>${rDate.toLocaleString('es-ES')}</td>
                <td><span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type === 'IN' ? 'ENTRADA' : 'SALIDA'}</span></td>
                <td style="font-size: 0.85rem; color: var(--text-secondary); max-width: 150px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${r.notes || ''}">${r.notes ? r.notes : '<span style="opacity:0.3">-</span>'}</td>
                <td><span style="color:var(--text-secondary); font-size: 0.8rem;">Cloud Store ✔</span></td>
            </tr>
            `;
        }).join('');
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
            const isSigned = periodRecords.length > 0 && periodRecords.every(r => r.is_validated);

            return `
                <tr>
                    <td style="font-weight: 500;">${u.full_name}</td>
                    <td style="font-family: monospace; font-weight: 700; color: var(--text-primary);">${Store.formatTime(hours)}</td>
                    <td>
                        <span class="badge ${isSigned ? 'badge-active' : 'badge-inactive'}" style="font-size: 0.75rem;">
                            ${isSigned ? 'FIRMADO' : (periodRecords.length > 0 ? 'PENDIENTE' : 'SIN DATOS')}
                        </span>
                    </td>
                    <td><span class="badge ${u.role === 'employer' ? 'badge-info' : (u.role === 'employee' ? 'badge-active' : 'badge-inactive')}">${u.role.toUpperCase()}</span></td>
                    <td style="text-align: right;">
                        <button class="btn btn-export-user" data-id="${u.id}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; background: var(--primary); color: white; border: none; margin-right: 0.5rem;" title="Exportar CSV de este mes">⬇️ Reporte</button>
                    </td>
                </tr>
            `;
        }));

        tbody.innerHTML = userRows.join('');

        // Attach Export
        document.querySelectorAll('.btn-export-user').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const filter = document.getElementById('employer-month-filter');
                const tMonth = filter ? filter.value : 'ALL';
                await Store.exportEmployeeCSV(id, tMonth);
            });
        });
    }
};
