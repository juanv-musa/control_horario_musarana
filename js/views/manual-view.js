import { Store } from '../store.js';
import { APP_CONFIG } from '../config.js';

export const ManualView = {
    render() {
        return `
            <div style="width: 100%; min-height: 100vh; background: #f9fafb;">
                <nav class="navbar">
                    <div class="nav-brand"><img src="${APP_CONFIG.logo}" alt="${APP_CONFIG.name}" style="height: 48px;"></div>
                    <div class="user-info"><button class="btn btn-secondary" onclick="window.history.back()">← Volver</button></div>
                </nav>
                <div class="container py-5">
                    <div class="glass-panel" style="max-width: 800px; margin: 0 auto; padding: 3rem;">
                        <h1 style="color: var(--primary); font-weight: 800; margin-bottom: 2rem;">📖 Manual de Usuario: ${APP_CONFIG.name}</h1>
                        <div class="manual-content" style="line-height: 1.6; color: var(--text-primary);">
                            <section style="margin-bottom: 3rem;"><h2>1. Empleado</h2><p>Fichaje IN/OUT y gestión de perfil.</p></section>
                            <section style="margin-bottom: 3rem;"><h2>2. Empresa</h2><p>Validación mensual y estadísticas.</p></section>
                            <section style="margin-bottom: 3rem;"><h2>3. Auditoría</h2><p>Acceso PIN y exportación legal CSV.</p></section>
                        </div>
                    </div>
                </div>
                <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem;"><p>${APP_CONFIG.footer}</p></footer>
            </div>
        `;
    }
};
