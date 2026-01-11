import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const maintenanceGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const isUnlocked = localStorage.getItem('site_unlocked') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('unlock') === 'soueu') { // <--- A TUA SENHA É 'soueu'
        localStorage.setItem('site_unlocked', 'true');
        return true; // Deixa passar
    }
    if (isUnlocked) {
        return true;
    }
    if (state.url !== '/brevemente') {
        return router.parseUrl('/brevemente');
    }
    return true;
};
