import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    imports: [RouterLink],
    templateUrl: './footer.component.html'
})
export class FooterComponent {

    resetCookies() {
        localStorage.removeItem('cookie_consent');
        window.location.reload(); // Recarrega a página para limpar o estado e mostrar o banner
    }
}
