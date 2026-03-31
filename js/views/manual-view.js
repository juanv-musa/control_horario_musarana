import { Store } from '../store.js';

export const ManualView = {
    render() {
        return `
            <div style="width: 100%; min-height: 100vh; background: #f9fafb;">
                <nav class="navbar">
                    <div class="nav-brand"><img src="assets/logo.png" alt="MUSARAÑA" style="height: 48px;"></div>
                    <div class="user-info">
                        <button class="btn btn-secondary" onclick="window.history.back()">← Volver</button>
                    </div>
                </nav>

                <div class="container py-5">
                    <div class="glass-panel" style="max-width: 800px; margin: 0 auto; padding: 3rem;">
                        <h1 style="color: var(--primary); font-weight: 800; margin-bottom: 2rem;">📖 Manual de Usuario: Musaraña Registro Jornada Laboral</h1>
                        
                        <div class="manual-content" style="line-height: 1.6; color: var(--text-primary);">
                            <section style="margin-bottom: 3rem;">
                                <h2 style="border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">👨‍💼 1. Guía para Empleados</h2>
                                <p><b>¿Cómo Fichar?</b><br>
                                Pulsa el botón verde <b>"FICHAR ENTRADA"</b> al empezar. Al terminar o para descansos, usa el botón rojo <b>"FICHAR SALIDA"</b>. Puedes añadir notas si hace falta.</p>
                                <p><b>Firma del Mes:</b> Es obligatorio validar tus registros al final de cada mes en la sección "Histórico y Validación".</p>
                            </section>

                            <section style="margin-bottom: 3rem;">
                                <h2 style="border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">🐜 2. Guía para el Administrador (Musaraña)</h2>
                                <p><b>Gestión de Usuarios:</b> Puedes añadir, editar nombres o cambiar roles de tus trabajadores desde la tabla de personal.</p>
                                <p><b>Firma de Empresa:</b> Tras la firma del empleado, debes entrar y pulsar "Firma Empresa" para sellar legalmente el mes.</p>
                                <p><b>Corregir Jornadas:</b> Si alguien olvida fichar, usa el icono ✏️ en el Historial Global o el botón "+ Añadir Olvido".</p>
                            </section>

                            <section style="margin-bottom: 3rem;">
                                <h2 style="border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">🕵️ 3. Guía para Auditoría</h2>
                                <p><b>Acceso PIN:</b> Para inspectores, se entra sin email usando el PIN de 6 dígitos que gestionas en tu panel.</p>
                            </section>

                            <div style="background: #f0fdf4; padding: 1.5rem; border-radius: var(--radius-sm); border-left: 5px solid var(--primary);">
                                <h4 style="margin: 0;">⚖️ Base Legal</h4>
                                <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Este sistema cumple con el Art. 34.9 ET sobre el control horario obligatorio.</p>
                            </div>
                        </div>
                    </div>
                <footer style="text-align: center; padding: 2rem; color: var(--text-secondary); font-size: 0.85rem; border-top: 1px solid var(--border); margin-top: 3rem; background: white;">
                    <p>Musaraña &copy; 2026</p>
                </footer>
            </div>
        `;
    },
    async init() {}
};
