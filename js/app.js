import { Store } from './store.js';
import { Router } from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('App Initialized. Checking user session...');
    
    // Globally expose navigate for easy logout buttons and links
    window.navigate = (path) => Router.navigate(path);
    
    window.logout = () => {
        Store.logout();
        Router.navigate('/');
        Store.showToast('Sesión cerrada exitosamente', 'success');
    };

    // Initial render
    Router.render();
});
