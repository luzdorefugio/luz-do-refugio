import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ShopProduct } from '../../../../core/models/shop-product.model';
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
        products = signal<ShopProduct[]>([]);
    reviews = signal<Review[]>([]);
    isProductsLoading = signal(true); // Começa a carregar
    isReviewsLoading = signal(true);  // Começa a carregar

    ngOnInit() {
        this.loadProducts();
        this.loadReviews();
      }

    loadProducts() {
        // AQUI é onde apanhas o "fim" do getProducts
        this.service.getProducts().subscribe({
          next: (data) => {
            this.products.set(data);
            this.isProductsLoading.set(false); // ✅ ACABOU: Desliga o esqueleto
          },
          error: (erro) => {
            console.error('Erro produtos:', erro);
            this.isProductsLoading.set(false); // ✅ ERRO: Desliga o esqueleto também
          }
        });
    }

    loadReviews() {
        this.reviewService.getAllShop().subscribe({
            next: (data: Review[]) => {
                this.reviews.set([...data, ...data]);
                this.isReviewsLoading.set(false); // ✅ ACABOU Reviews
            },
            error: (erro) => {
                console.error('Erro reviews:', erro);
                this.isReviewsLoading.set(false); // ✅ ERRO Reviews
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
