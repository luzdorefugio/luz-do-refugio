import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private measurementId = environment.analyticsId;
    private storageKey = 'cookie_consent';

    constructor() { }

    public init() {
        const consent = localStorage.getItem(this.storageKey);
        if (consent === 'true') {
            this.loadGoogleAnalytics();
        }
        return consent; // Retorna 'true', 'false' ou null (se ainda não escolheu)
    }

    /**
    * Utilizador Aceitou
    */
    public acceptCookies() {
        localStorage.setItem(this.storageKey, 'true');
        this.loadGoogleAnalytics();
    }

    /**
    * Utilizador Recusou
    */
    public rejectCookies() {
        localStorage.setItem(this.storageKey, 'false');
    }

    /**
    * A Magia: Injeta o script no HTML dinamicamente
    */
    private loadGoogleAnalytics() {
        if (document.getElementById('google-analytics-script')) {
            return; // Já está carregado, não fazemos nada
        }

        // 1. Cria a tag <script async src="...">
        const script = document.createElement('script');
        script.id = 'google-analytics-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
        document.head.appendChild(script);

        // 2. Configura o dataLayer e o gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', this.measurementId);

        console.log('📊 Google Analytics carregado com sucesso!');
    }
}
