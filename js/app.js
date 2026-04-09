import { Store } from './store.js?v=999';
import { Router } from './router.js?v=999';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('App Initialized. Checking user session...');
    
    // Ensure Store (Supabase client) is ready
    await Store.init();
    
    // Globally expose navigate for easy logout buttons and links
    window.navigate = (path) => Router.navigate(path);
    
    window.logout = async () => {
        await Store.logout();
        Router.navigate('/');
        Store.showToast('Sesión cerrada exitosamente', 'success');
    };

    // Initial render
    Router.render();
});
