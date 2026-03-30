import { Store } from '../store.js';
import { Router } from '../router.js';

export const LoginView = {
    render() {
        return `
            <div class="container" style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%);">
                <div class="glass-panel" style="width: 100%; max-width: 420px; padding: 3rem; text-align: center; border: 1px solid rgba(255,255,255,0.8);">
                    <img src="assets/logo.png" alt="MUSARAÑA Logo" style="height: 80px; margin-bottom: 2.5rem; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));">
                    
                    <div id="login-content">
                        <h1 style="font-size: 1.5rem; margin-bottom: 2.5rem; color: var(--text-primary); font-weight: 800; letter-spacing: -0.025em;">Registro de Jornada</h1>
                        
                        <form id="login-form">
                            <div class="form-group" style="text-align: left;">
                                <label class="form-label" style="font-weight: 600; font-size: 0.85rem; color: var(--text-secondary);">Correo Electrónico</label>
                                <input type="email" id="email" class="form-control" placeholder="ejemplo@empresa.com" required style="padding: 0.85rem 1rem;">
                            </div>
                            <div class="form-group" style="text-align: left; margin-top: 1.5rem;">
                                <label class="form-label" style="font-weight: 600; font-size: 0.85rem; color: var(--text-secondary);">Contraseña</label>
                                <input type="password" id="password" class="form-control" placeholder="••••••••" required style="padding: 0.85rem 1rem;">
                            </div>
                            <button type="submit" class="btn btn-primary btn-block" style="margin-top: 2rem; padding: 1rem; font-weight: 700; background: var(--primary); box-shadow: 0 10px 20px rgba(140, 198, 63, 0.2);">Acceder al Panel</button>
                        </form>
                        
                        <div id="auditor-portal-link" style="margin-top: 2.5rem; text-align: center; border-top: 1px solid var(--border); padding-top: 2rem;">
                            <a href="#/manual" style="display: block; font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; margin-bottom: 1rem; transition: color 0.3s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-secondary)'">📖 Ver Manual de Usuario</a>
                            <a href="javascript:void(0)" id="btn-show-audit" style="font-size: 0.75rem; color: var(--danger); text-decoration: none; opacity: 0.8; font-weight: 600;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">Gestión Cuerpo de Inspección (PIN)</a>
                        </div>
                    </div>

                    <div id="audit-content" style="display: none;">
                        <h3 class="mb-4">Portal de Auditoría Legal</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Introduzca el código de acceso proporcionado por la empresa.</p>
                        <form id="audit-form">
                            <div class="form-group">
                                <label class="form-label" for="audit-pin">Código de Acceso (PIN)</label>
                                <input type="password" id="audit-pin" class="form-control" placeholder="6 dígitos" required style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;" maxlength="8">
                            </div>
                            <button type="submit" class="btn btn-danger btn-block btn-lg">Acceso Oficial</button>
                        </form>
                        <div style="margin-top: 1.5rem;">
                            <button id="btn-hide-audit" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem;">&larr; Volver al acceso de personal</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const loginForm = document.getElementById('login-form');
        const auditForm = document.getElementById('audit-form');
        const loginContent = document.getElementById('login-content');
        const auditContent = document.getElementById('audit-content');
        const btnShowAudit = document.getElementById('btn-show-audit');
        const btnHideAudit = document.getElementById('btn-hide-audit');

        if (btnShowAudit) {
            btnShowAudit.addEventListener('click', () => {
                loginContent.style.display = 'none';
                auditContent.style.display = 'block';
            });
        }

        if (btnHideAudit) {
            btnHideAudit.addEventListener('click', () => {
                loginContent.style.display = 'block';
                auditContent.style.display = 'none';
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const pass = document.getElementById('password').value;
                
                const user = await Store.login(email, pass);
                if (user) {
                    Store.showToast(`Bienvenido ${user.full_name}`);
                    if (user.role === 'employee') Router.navigate('/employee');
                    else if (user.role === 'employer') Router.navigate('/employer');
                    else if (user.role === 'auditor') Router.navigate('/auditor');
                }
            });
        }

        if (auditForm) {
            auditForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const pin = document.getElementById('audit-pin').value;
                const user = await Store.loginWithCode(pin);
                if (user) {
                    Store.showToast('Acceso de Auditoría Concedido');
                    Router.navigate('/auditor');
                }
            });
        }
    }
};
