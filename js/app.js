import { Router } from './router.js';

window.addEventListener('DOMContentLoaded', () => {
    Router.render();
});

window.logout = async () => {
    const { Store } = await import('./store.js');
    await Store.logout();
    Router.navigate('/login');
};
