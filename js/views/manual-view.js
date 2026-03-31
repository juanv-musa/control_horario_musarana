import { Store } from '../store.js';
import { APP_CONFIG } from '../config.js';

export const ManualView = {
    render() {
        return `
            <div style="width: 100%; min-height: 100vh; background: #f9fafb;">
                <nav class="navbar">
                    <div class="nav-brand"><img src="${APP_CONFIG.logo}" alt="${APP_CONFIG.name}" style="height: 48px;"></div>
                    <div class="user-info">
                        <button class="btn btn-secondary" onclick="window.history.back()">← Volver</button>
                    </div>
                </nav>
                <div class="container py-5">
                    <div class="glass-panel" style="max-width: 800px; margin: 0 auto; padding: 3rem;">
                        <h1 style="color: var(--primary); font-weight: 800; margin-bottom: 2rem;">📖 Manual de Usuario: ${APP_CONFIG.name} Registro Jornada Laboral</h1>
                        <div class="manual-content" style="line-height: 1.6; color: var(--text-primary);">
                            <section style="margin-bottom: 3rem;">
                                <h2 style="margin-bottom: 1rem;">1. Rol de Empleado</h2>
                                <ul style="padding-left: 1.5rem;">
                                    <li><strong>Fichaje IN/OUT</strong>: Use el botón principal para iniciar o detener su jornada. El sistema guardará la marca de tiempo exacta de manera inalterable.</li>
                                    <li><strong>Notas</strong>: Puede añadir notas opcionales en cada fichaje para justificar incidencias.</li>
                                    <li><strong>Perfil</strong>: Al final del panel puede actualizar su nombre o contraseña (obligatorio tras el primer acceso).</li>
                                </ul>
                            </section>
                            <section style="margin-bottom: 3rem;">
                                <h2 style="margin-bottom: 1rem;">2. Rol de Empresa (Consultoría)</h2>
                                <ul style="padding-left: 1.5rem;">
                                    <li><strong>Panel de Control</strong>: Visualice en tiempo real cuántas personas están trabajando actualmente.</li>
                                    <li><strong>Validación Mensual</strong>: Revise los registros del mes y use el botón "Validar Mes" para certificar que la información es correcta conforme a ley.</li>
                                    <li><strong>Auditoría</strong>: El sistema mantiene un registro auditable de todas las modificaciones (si las hubiera).</li>
                                </ul>
                            </section>
                            <section style="margin-bottom: 3rem;">
                                <h2 style="margin-bottom: 1rem;">3. Gestión Cuerpo de Inspección (Auditoría)</h2>
                                <ul style="padding-left: 1.5rem;">
                                    <li><strong>Acceso Seguro</strong>: Requiere un código PIN de 6 dígitos proporcionado por la empresa.</li>
                                    <li><strong>Transparencia</strong>: Los auditores tienen acceso total e inalterable a los registros para inspecciones de trabajo.</li>
                                    <li><strong>Exportación</strong>: Genera reportes CSV con validez legal incluyendo firmas digitales y sumatorios de horas.</li>
                                </ul>
                            </section> section>
                        </div>
                    </div>
                </div>
                <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem; border-top: 1px solid var(--border); margin-top: 3rem; background: white;">
                    <p>${APP_CONFIG.footer}</p>
                </footer>
            </div>
        `;
    }
};
