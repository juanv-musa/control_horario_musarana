import { Store } from '../store.js';
import { APP_CONFIG } from '../config.js';

export const EmployeeDashboard = {
    render() {
        const user = Store.getUser();
        return `
            <div style="width: 100%; min-height: 100vh; background: #f9fafb;">
                <nav class="navbar">
                    <div class="nav-brand"><img src="${APP_CONFIG.logo}" alt="${APP_CONFIG.name}" style="height: 48px;"></div>
                    <div class="user-info">
                        <a href="#/manual" class="btn btn-secondary" style="margin-right: 1rem; background: #EEF2FF; color: #6366F1; border: none; font-size: 0.85rem;">📖 Manual</a>
                        <span class="user-role">Empleado</span>
                        <span style="font-weight: 500;">${user.full_name}</span>
                        <button class="logout-btn" onclick="window.logout()">Salir</button>
                    </div>
                </nav>
                <div class="container mt-6">
                    <div class="glass-panel" style="padding: 3rem; text-align: center;">
                        <div id="status-container" class="mb-4">
                            <span class="badge badge-inactive" style="padding: 0.5rem 1rem; font-size: 0.9rem;">● FUERA DE JORNADA</span>
                        </div>
                        <h1 id="timer-display" style="font-size: 4rem; font-weight: 800; margin-bottom: 2rem; font-variant-numeric: tabular-nums; display: none;">00:00:00</h1>
                        <div style="max-width: 400px; margin: 0 auto;">
                            <div class="form-group" style="text-align: left;">
                                <label class="form-label">Notas (Opcional)</label>
                                <textarea id="clock-notes" class="form-control" placeholder="Indique incidencias o tareas..." rows="2"></textarea>
                            </div>
                            <button id="btn-clock" class="btn btn-primary" style="width: 100%; padding: 1.5rem; font-size: 1.25rem; font-weight: 700; border-radius: 1rem; box-shadow: 0 10px 25px rgba(140, 198, 63, 0.3);">INICIAR REGISTRO</button>
                        </div>
                    </div>

                    <div class="glass-panel mt-6" style="padding: 2.5rem;">
                        <h3 style="margin-bottom: 1.5rem;">⚙️ Configuración de Perfil</h3>
                        <form id="profile-form" class="dashboard-grid">
                            <div class="form-group">
                                <label class="form-label">Nombre Completo</label>
                                <input type="text" id="profile-name" class="form-control" value="${user.full_name}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Nueva Contraseña (Opcional)</label>
                                <input type="password" id="profile-password" class="form-control" placeholder="Dejar en blanco para mantener">
                            </div>
                            <div style="grid-column: 1 / -1;">
                                <button type="submit" class="btn btn-secondary">Actualizar Perfil</button>
                            </div>
                        </form>
                    </div>
                </div>
                <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem; border-top: 1px solid var(--border); margin-top: 3rem; background: white;">
                    <p>${APP_CONFIG.footer}</p>
                </footer>
            </div>
        `;
    },
    async init() {
        const user = Store.getUser();
        const btnClock = document.getElementById('btn-clock');
        const timerDisplay = document.getElementById('timer-display');
        const statusContainer = document.getElementById('status-container');
        const profileForm = document.getElementById('profile-form');
        let timerInterval;

        const updateUI = async (forcedStatus) => {
            const currentStatus = forcedStatus || await Store.getEmployeeStatus(user.id);
            const isWorking = (currentStatus === 'IN');
            
            if (isWorking) {
                btnClock.textContent = 'DETENER REGISTRO';
                btnClock.style.background = 'var(--danger)';
                btnClock.style.boxShadow = '0 10px 25px rgba(239, 68, 68, 0.3)';
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
                btnClock.textContent = 'INICIAR REGISTRO';
                btnClock.style.background = 'var(--primary)';
                btnClock.style.boxShadow = '0 10px 25px rgba(140, 198, 63, 0.3)';
                statusContainer.innerHTML = '<span class="badge badge-inactive" style="padding: 0.5rem 1rem; font-size: 0.9rem;">● FUERA DE JORNADA</span>';
                timerDisplay.style.display = 'none';
                if (timerInterval) clearInterval(timerInterval);
            }
        };

        await updateUI();

        btnClock.onclick = async () => {
            const currentStatus = await Store.getEmployeeStatus(user.id);
            const action = currentStatus === 'IN' ? 'OUT' : 'IN';
            const notes = document.getElementById('clock-notes').value;
            const res = await Store.clockAction(user.id, action, notes);
            if (res) { Store.showToast(action === 'IN' ? 'Entrada registrada' : 'Salida registrada'); updateUI(action); document.getElementById('clock-notes').value = ''; }
        };

        if (profileForm) profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await Store.updateProfile(user.id, document.getElementById('profile-name').value, document.getElementById('profile-password').value);
            if (res) { Store.showToast('Perfil actualizado correctamente'); setTimeout(() => window.location.reload(), 1500); }
        });
    }
};
