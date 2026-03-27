import { Store } from './store.js';

// Import Views
import { LoginView } from './views/login.js';
import { EmployeeDashboard } from './views/dashboard-employee.js';
import { EmployerDashboard } from './views/dashboard-employer.js';
import { AuditorDashboard } from './views/dashboard-auditor.js';

export const Router = {
    routes: {
        '/': LoginView,
        '/employee': EmployeeDashboard,
        '/employer': EmployerDashboard,
        '/auditor': AuditorDashboard,
    },

    navigate(path) {
        window.history.pushState({}, path, window.location.origin + '#' + path);
        this.render();
    },

    render() {
        const path = window.location.hash.slice(1) || '/';
        const app = document.getElementById('app');
        const user = Store.getUser();

        console.log(`Navigating to ${path}`, user);

        // Security / Guards
        if (path !== '/' && !user) {
            console.warn('Unauthorized routing attempt. Redirecting to login.');
            this.navigate('/');
            return;
        }

        if (path === '/' && user) {
            // Re-route logged in users away from login
            if (user.role === 'employee') this.navigate('/employee');
            else if (user.role === 'employer') this.navigate('/employer');
            else if (user.role === 'auditor') this.navigate('/auditor');
            return;
        }
        
        // Role check
        if (user) {
             if (path === '/employee' && user.role !== 'employee') return this.navigate('/');
             if (path === '/employer' && user.role !== 'employer') return this.navigate('/');
             if (path === '/auditor' && user.role !== 'auditor') return this.navigate('/');
        }

        const component = this.routes[path];
        if (component) {
            // Destroy phase for previous components (if needed, simplified here)
            app.innerHTML = component.render();
            if (component.init) {
                // Async initialization inside setTimeout to assure DOM is ready
                setTimeout(() => component.init(), 0);
            }
        } else {
            app.innerHTML = '<h2>404 - Page Not Found</h2>';
        }
    }
};

// Listen to back/forward buttons
window.addEventListener('popstate', () => {
    Router.render();
});
