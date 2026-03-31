import { Store } from '../store.js';
import { Router } from '../router.js';
import { APP_CONFIG } from '../config.js';

export const LoginView = {
    render() {
        return `
            <div class="container" style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%);">
                <div class="glass-panel" style="width: 100%; max-width: 420px; padding: 3rem; text-align: center; border: 1px solid rgba(255,255,255,0.8); margin: 2rem 0;">
                    <img src="${APP_CONFIG.logo}" alt="${APP_CONFIG.name} Logo" style="height: 80px; margin-bottom: 2.5rem; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.1));">
                    <div id="login-content">
                        <h1 style="font-size: 1.5rem; margin-bottom: 2.5rem; color: var(--text-primary); font-weight: 800; letter-spacing: -0.025em;">Registro de Jornada</h1>
                        <form id="login-form">
                            <div class="form-group" style="text-align: left;"><label class="form-label">Correo</label><input type="email" id="email" class="form-control" placeholder="ejemplo@empresa.com" required></div>
                            <div class="form-group" style="text-align: left; margin-top: 1.5rem;"><label class="form-label">Contraseña</label><input type="password" id="password" class="form-control" placeholder="••••••••" required></div>
                            <button type="submit" class="btn btn-primary btn-block" style="width:100%; margin-top: 2rem; padding: 1rem; font-weight: 700;">Acceder al Panel</button>
                        </form>
                        <div style="margin-top: 2.5rem; text-align: center; border-top: 1px solid var(--border); padding-top: 2rem;">
                            <a href="javascript:void(0)" id="btn-show-audit" style="font-size: 0.75rem; color: var(--danger); text-decoration: none; opacity: 0.8; font-weight: 600;">Gestión Cuerpo de Inspección (PIN)</a>
                        </div>
                    </div>
                    <div id="audit-content" style="display: none;">
                        <h3 class="mb-4">Portal de Auditoría Legal</h3>
                        <form id="audit-form">
                            <div class="form-group"><label class="form-label">Código (PIN)</label><input type="password" id="audit-pin" class="form-control" placeholder="6 dígitos" required style="text-align: center; font-size: 1.5rem; letter-spacing: 0.5rem;" maxlength="8"></div>
                            <button type="submit" class="btn btn-danger btn-block btn-lg" style="width:100%;">Acceso Oficial</button>
                        </form>
                        <div style="margin-top: 1.5rem;"><button id="btn-hide-audit" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem;">&larr; Volver</button></div>
                    </div>
                </div>
                <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem;"><p>${APP_CONFIG.footer}</p></footer>
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
        if (btnShowAudit) btnShowAudit.addEventListener('click', () => { loginContent.style.display = 'none'; auditContent.style.display = 'block'; });
        if (btnHideAudit) btnHideAudit.addEventListener('click', () => { loginContent.style.display = 'block'; auditContent.style.display = 'none'; });
        if (loginForm) loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = await Store.login(document.getElementById('email').value, document.getElementById('password').value);
            if (user) { if (user.role === 'employee') Router.navigate('/employee'); else if (user.role === 'employer') Router.navigate('/employer'); else if (user.role === 'auditor') Router.navigate('/auditor'); }
        });
        if (auditForm) auditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = await Store.loginWithCode(document.getElementById('audit-pin').value);
            if (user) Router.navigate('/auditor');
        });
    }
};
