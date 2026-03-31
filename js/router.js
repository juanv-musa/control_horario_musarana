import { Store } from './store.js';

// Import Views
import { LoginView } from './views/login.js';
import { EmployeeDashboard } from './views/dashboard-employee.js';
import { EmployerDashboard } from './views/dashboard-employer.js';
import { AuditorDashboard } from './views/dashboard-auditor.js';
import { ManualView } from './views/manual-view.js';

export const Router = {
    routes: {
        '/': LoginView,
        '/login': LoginView,
        '/employee': EmployeeDashboard,
        '/employer': EmployerDashboard,
        '/auditor': AuditorDashboard,
        '/manual': ManualView
    },

    navigate(path) {
        window.location.hash = path;
        this.render();
    },

    render() {
        const path = window.location.hash.slice(1) || '/';
        const app = document.getElementById('app');
        const user = Store.getUser();

        // Guards
        if (path !== '/' && !user) return this.navigate('/');
        if (path === '/' && user) {
            if (user.role === 'employee') return this.navigate('/employee');
            if (user.role === 'employer') return this.navigate('/employer');
            if (user.role === 'auditor') return this.navigate('/auditor');
        }

        // Role check
        if (user) {
            if (path === '/employee' && user.role !== 'employee') return this.navigate('/');
            if (path === '/employer' && user.role !== 'employer') return this.navigate('/');
            if (path === '/auditor' && user.role !== 'auditor') return this.navigate('/');
        }

        const component = this.routes[path];
        if (component) {
            app.innerHTML = component.render();
            if (component.init) setTimeout(() => component.init(), 0);
        } else {
            app.innerHTML = '<h2>404 - No Encontrado</h2>';
        }
    }
};

window.addEventListener('popstate', () => Router.render());
