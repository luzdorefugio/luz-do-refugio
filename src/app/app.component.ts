import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { AnalyticsService } from './core/services/analytics.service'; // Ajusta o caminho se necessário
import * as AOS from 'aos';
declare var feather: any;

@Component({
  selector: 'app-root',
  imports: [
      RouterOutlet
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
    analyticsService = inject(AnalyticsService);

  ngOnInit() {
    const consent = this.analyticsService.init();
    if (consent === null) {
      this.showCookieBanner();
    }
    // Iniciar animações
    AOS.init({
      duration: 800, // Duração da animação
      once: true,    // Animar apenas uma vez
    });

    // Iniciar ícones (se estiveres a usar data-feather)
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }

  showCookieBanner() {
    Swal.fire({
      title: '🍪 Usamos Cookies',
      text: 'Utilizamos cookies para analisar o tráfego e melhorar a tua experiência na loja.',
      icon: 'info',

      // Configuração visual "Toast" (Barra no fundo)
      toast: true,
      position: 'bottom',
      width: '100%',
      padding: '1rem',
      background: '#fff',

      showConfirmButton: true,
      showDenyButton: true,
      confirmButtonText: 'Aceitar Tudo',
      denyButtonText: 'Apenas Essenciais',
      confirmButtonColor: '#d4af37', // A tua cor dourada
      denyButtonColor: '#6e7881',

      // Obriga o utilizador a escolher (não fecha se clicar fora)
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: false, // Permite navegar no site enquanto o banner está lá

      customClass: {
        popup: 'cookie-banner-shadow' // Classe para dares estilo extra se quiseres
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.analyticsService.acceptCookies();
        this.showFeedback('Obrigado! A tua experiência será otimizada.');
      } else if (result.isDenied) {
        this.analyticsService.rejectCookies();
        this.showFeedback('Entendido. Não usaremos cookies de análise.');
      }
    });
  }

  showFeedback(message: string) {
    Swal.fire({
      text: message,
      icon: 'success',
      toast: true,
      position: 'bottom-end', // Canto inferior direito
      timer: 3000,
      showConfirmButton: false
    });
  }
}
