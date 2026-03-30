import { Store } from '../store.js';
import { Router } from '../router.js';

export const LoginView = {
    render() {
        return `
            <div class="container" style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
                <div class="glass-panel" style="width: 100%; max-width: 400px; padding: 2.5rem; text-align: center;">
                    <img src="assets/logo.png" alt="MUSARANA Logo" style="height: 50px; margin-bottom: 2rem;">
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
                </div>
            </div>
        `;
    },

    init() {
        const form = document.getElementById('login-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
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
};
