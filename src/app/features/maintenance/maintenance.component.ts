import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maintenance',
  standalone: true, // Angular moderno usa standalone por defeito
  imports: [CommonModule],
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css']
})
export class MaintenanceComponent {
    // Podes adicionar lógica aqui se quiseres, ex: data prevista de regresso
    expectedReturn = '25 de Janeiro';
    contactEmail = 'geral@luzdorefugio.pt'; // Ajusta para o teu email real
    isLogoMissing = false;

    onLogoError() {
        this.isLogoMissing = true;
    }
}
