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
                        <span class="user-role">Admin</span>
                        <span style="font-weight: 500;">${user.name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container mt-6">
                    <div class="dashboard-grid">
                        <div class="glass-panel stat-card">
                            <span class="stat-title">Registros de Hoy</span>
                            <span class="stat-value" id="stats-today">0</span>
                        </div>
                        <div class="glass-panel stat-card">
                            <span class="stat-title">Personal Activo (IN)</span>
                            <span class="stat-value" id="stats-active">0</span>
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
                                    <label class="form-label">Usuario de Acceso</label>
                                    <input type="text" id="nu-username" class="form-control" required>
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Nueva Contraseña</label>
                                    <input type="password" id="nu-password" class="form-control" placeholder="Obligatorio para nuevos">
                                </div>
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label">Rol Interno</label>
                                    <select id="nu-role" class="form-control" required>
                                        <option value="employee">Empleado (Ficha horarios)</option>
                                        <option value="employer">Administrador (Control Total)</option>
                                        <option value="auditor">Inspector (Auditoría Lectura)</option>
                                    </select>
                                </div>
                                <div style="grid-column: 1 / -1; margin-top: 1rem;">
                                    <button type="submit" class="btn btn-primary" id="nu-submit">Guardar</button>
                                    <button type="button" class="btn" id="btn-cancel-new-user" style="margin-left: 0.5rem; background: white; border: 1px solid var(--border);">Cancelar</button>
                                </div>
                            </form>
                        </div>

                        <div class="table-container">
                            <table class="table" id="users-table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Nombre Completo</th>
                                        <th>Horas (Mes)</th>
                                        <th>Rol Interno</th>
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
        `;
    },

    init() {
        // Stats are now computed inside renderGlobalRecords to ensure they don't block
        
        const availableMonths = Store.getAvailableMonths();

        // Profile Form
        const user = Store.getUser();
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newName = document.getElementById('profile-name').value;
                const newPass = document.getElementById('profile-password').value;
                
                const updated = Store.updateProfile(user.id, newName, newPass || null);
                if (updated) {
                    Store.showToast('Perfil actualizado correctamente', 'success');
                    Router.render();
                } else {
                    Store.showToast('Error al actualizar el perfil', 'error');
                }
            });
        }

        // Initialize User Management
        const monthFilter = document.getElementById('employer-month-filter');
        let targetMonth = availableMonths[0]; // Default to newest
        
        if (monthFilter && availableMonths.length > 0) {
            monthFilter.innerHTML = availableMonths.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
            monthFilter.addEventListener('change', (e) => {
                targetMonth = e.target.value;
                this.renderUsers(targetMonth);
            });
        }

        this.renderUsers(targetMonth);

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
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const userData = {
                    id: document.getElementById('nu-id').value,
                    name: document.getElementById('nu-name').value,
                    username: document.getElementById('nu-username').value,
                    role: document.getElementById('nu-role').value,
                    password: document.getElementById('nu-password').value
                };
                
                if (!userData.id && !userData.password) {
                    return Store.showToast('La contraseña es obligatoria para usuarios nuevos', 'error');
                }

                const res = Store.adminSaveUser(userData);
                if (res.success) {
                    Store.showToast('Usuario guardado con éxito', 'success');
                    formContainer.style.display = 'none';
                    toggleBtn.style.display = 'block';
                    this.renderUsers();
                } else {
                    Store.showToast(res.error, 'error');
                }
            });
        }

        // Initialize Global Records Pagination
        const globalMonthFilter = document.getElementById('employer-global-month-filter');
        let globalTargetMonth = availableMonths[0]; // Default to newest
        
        if (globalMonthFilter && availableMonths.length > 0) {
            globalMonthFilter.innerHTML = availableMonths.map(m => `<option value="${m}">${Store.formatMonthLabel(m)}</option>`).join('');
            globalMonthFilter.addEventListener('change', (e) => {
                globalTargetMonth = e.target.value;
                this.renderGlobalRecords(globalTargetMonth);
            });
        }
        
        this.renderGlobalRecords(globalTargetMonth);
    },

    renderGlobalRecords(monthStr = null) {
        if (!monthStr) {
            const mList = Store.getAvailableMonths();
            if (mList.length > 0) monthStr = mList[0];
        }

        const tbody = document.querySelector('#global-records tbody');
        if (!tbody) return;

        let records = Store.getRecords().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Calculate global metrics before filtering UI table
        let todayCount = 0;
        let activeCount = 0;
        const usersStatus = {};
        const today = new Date().toDateString();

        records.forEach(r => {
            const rDate = new Date(r.timestamp);
            if (rDate.toDateString() === today) {
                todayCount++;
            }
            if (!usersStatus[r.userId]) {
                usersStatus[r.userId] = r.type;
                if (r.type === 'IN') {
                    activeCount++;
                }
            }
        });

        const statToday = document.getElementById('stats-today');
        const statActive = document.getElementById('stats-active');
        if (statToday) statToday.textContent = todayCount;
        if (statActive) statActive.textContent = activeCount;

        // Apply visual table filtering
        if (monthStr) {
            const [year, month] = monthStr.split('-');
            records = records.filter(r => {
                const d = new Date(r.timestamp);
                return d.getFullYear() === parseInt(year) && d.getMonth() === (parseInt(month) - 1);
            });
        }

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-secondary">No hay registros en la base de datos para este periodo.</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(r => {
            const rDate = new Date(r.timestamp);
            return `
            <tr>
                <td style="font-weight: 500; color: var(--primary);">${r.userName}</td>
                <td>${rDate.toLocaleString('es-ES')}</td>
                <td><span class="badge ${r.type === 'IN' ? 'badge-active' : 'badge-inactive'}">${r.type === 'IN' ? 'ENTRADA' : 'SALIDA'}</span></td>
                <td style="font-size: 0.85rem; color: var(--text-secondary); max-width: 150px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${r.notes || ''}">${r.notes ? r.notes : '<span style="opacity:0.3">-</span>'}</td>
                <td><span style="color:var(--text-secondary); font-size: 0.8rem;">Verificado ✔</span></td>
            </tr>
            `;
        }).join('');
    },

    renderUsers(monthStr = null) {
        if (!monthStr) {
            const mList = Store.getAvailableMonths();
            if (mList.length > 0) monthStr = mList[0];
        }

        const users = Store.adminGetAllUsers();
        const tbody = document.querySelector('#users-table tbody');
        if (!tbody) return;

        tbody.innerHTML = users.map(u => `
            <tr>
                <td style="font-weight: 500;">${u.username}</td>
                <td>${u.name}</td>
                <td style="font-family: monospace; font-weight: 700; color: var(--text-primary);">${Store.formatTime(Store.calculateMonthlyHours(u.id, monthStr))}</td>
                <td><span class="badge ${u.role === 'employer' ? 'badge-info' : (u.role === 'employee' ? 'badge-active' : 'badge-inactive')}">${u.role.toUpperCase()}</span></td>
                <td style="text-align: right;">
                    <button class="btn btn-export-user" data-id="${u.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--primary); color: white; border: none; margin-right: 0.5rem;" title="Descargar mes en CSV">⬇️</button>
                    <button class="btn btn-edit-user" data-id="${u.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: white; border: 1px solid var(--border); color: var(--text-primary);">Editar</button>
                    ${u.id !== Store.getUser().id ? `<button class="btn btn-delete-user" data-id="${u.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--danger); color: white; border: none; margin-left: 0.5rem;">Borrar</button>` : ''}
                </td>
            </tr>
        `).join('');

        // Attach events
        document.querySelectorAll('.btn-export-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const filter = document.getElementById('employer-month-filter');
                const tMonth = filter ? filter.value : 'ALL';
                
                Store.exportEmployeeCSV(id, tMonth);
            });
        });

        document.querySelectorAll('.btn-edit-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const user = users.find(u => u.id == id);
                document.getElementById('nu-id').value = user.id;
                document.getElementById('nu-name').value = user.name;
                document.getElementById('nu-username').value = user.username;
                document.getElementById('nu-role').value = user.role;
                document.getElementById('new-user-title').textContent = 'Editar Usuario';
                document.getElementById('new-user-form-container').style.display = 'block';
                document.getElementById('btn-toggle-new-user').style.display = 'none';
            });
        });

        document.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('¿Deseas dar de baja a este usuario? Esta acción es irreversible.')) {
                    const id = e.currentTarget.getAttribute('data-id');
                    const res = Store.adminDeleteUser(id);
                    if (res?.success === false) return Store.showToast(res.error, 'error');
                    Store.showToast('Usuario dado de baja', 'success');
                    this.renderUsers();
                }
            });
        });
    }
};
