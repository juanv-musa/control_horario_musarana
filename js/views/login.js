import { Store } from '../store.js';
import { Router } from '../router.js';

export const LoginView = {
    render() {
        return `
            <div class="container" style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
                <div class="glass-panel" style="width: 100%; max-width: 400px; padding: 2.5rem; text-align: center;">
                    <img src="assets/logo.png" alt="MUSARANA Logo" style="height: 60px; margin-bottom: 2rem;">
                    
                    <div id="login-content">
                        <form id="login-form">
                            <div class="form-group">
                                <label class="form-label" for="email">Correo Electrónico</label>
                                <input type="email" id="email" class="form-control" placeholder="tu@email.com" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="password">Contraseña</label>
                                <input type="password" id="password" class="form-control" placeholder="•••" required>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block btn-lg mt-4">Iniciar Sesión</button>
                        </form>
                        <div style="margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 1.5rem;">
                            <button id="btn-show-audit" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; text-decoration: underline; font-size: 0.85rem;">Portal para Cuerpo de Inspección (PIN)</button>
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
