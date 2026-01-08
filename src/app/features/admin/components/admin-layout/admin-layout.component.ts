import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component'; // <--- IMPORTAR
import { HeaderComponent } from '../header/header.component';   // <--- IMPORTAR

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent], // <--- ADICIONAR
  templateUrl: './admin-layout.component.html',
  styles: []
})
export class AdminLayoutComponent {}
