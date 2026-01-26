import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
    selector: 'app-blog-layout',
    imports: [RouterOutlet, HeaderComponent, FooterComponent],
    templateUrl: './blog-layout.component.html'
})
export class BlogLayoutComponent {}
