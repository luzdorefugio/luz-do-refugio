import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ShopProductService } from '../../../../core/services/shop-product.service';
import { ReviewService } from '../../../../core/services/review.service';

// Declarações globais para as bibliotecas de animação
declare var AOS: any;
declare var feather: any;

// Interface simples para as reviews
interface Review {
  authorName: string;
  content: string;
  rating: number;
}

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [CommonModule, ProductCardComponent, RouterLink],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, AfterViewInit {
    private service = inject(ShopProductService);
    private reviewService = inject(ReviewService);
    products = this.service.products;
    reviews = signal<Review[]>([]);

    ngOnInit() {
        this.service.getProducts();
        this.reviewService.getAllShop().subscribe({
            next: (data: Review[]) => {
                this.reviews.set([...data, ...data]);
            },
            error: (erro) => {
                console.error('Erro ao carregar reviews', erro);
            }
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if (typeof AOS !== 'undefined') {
                AOS.init({ duration: 800, once: true });
            }
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }, 100);
    }
}
