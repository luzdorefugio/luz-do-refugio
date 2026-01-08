import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'; // Added Forms

// Services & Models
import { ShopProductService } from '../../../../core/services/shop-product.service';
import { ShopProduct } from '../../../../core/models/shop-product.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { CartService } from '../../../../core/services/cart.service';
import { ReviewService } from '../../../../core/services/review.service'; // Added Review Service

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule], // Added ReactiveFormsModule
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
    private titleService = inject(Title);
    private metaService = inject(Meta);
    private route = inject(ActivatedRoute);
    private productService = inject(ShopProductService);
    private notiService = inject(NotificationService);
    private location = inject(Location);
    private cartService = inject(CartService);
    private reviewService = inject(ReviewService); // Added
    private fb = inject(FormBuilder); // Added

    // Product State (Signals)
    product = signal<ShopProduct | null>(null);
    isLoading = signal(true);
    quantity = signal(1);
    selectedImageIndex = signal(0);

    // Review State (Signals)
    showReviewForm = signal(false);
    successMessage = signal(false);

    // Review Form
    reviewForm: FormGroup = this.fb.group({
        authorName: ['', Validators.required],
        rating: [5, Validators.required],
        content: ['', Validators.required],
        active: false
    });

    productImages = computed(() => {
        const p = this.product();
        if (!p) return [];
        return [
            `shop/${p.sku}_1.jpg`,
            `shop/${p.sku}_2.jpg`
        ];
    });

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');

        if (id) {
            this.productService.getProductById(id).subscribe({
                next: (data) => {
                    this.product.set(data);
                    this.titleService.setTitle(`${data.name} | Luz do Refúgio`);

                    this.metaService.updateTag({ name: 'description', content: `Descubra a vela ${data.name}. ${data.description}` });

                    // Tentar atualizar a imagem de partilha (Funciona no Facebook, no WhatsApp é mais difícil em SPAs sem SSR)
                    this.metaService.updateTag({ property: 'og:title', content: data.name });
                    this.metaService.updateTag({ property: 'og:image', content: 'https://www.luzdorefugio.pt/assets/' + this.productImages()[0] });
                    this.isLoading.set(false);
                },
                error: (err) => {
                    this.isLoading.set(false);
                }
            });
        } else {
            this.isLoading.set(false);
        }
    }

    // --- Product Actions ---

    goBack() {
        this.location.back();
    }

    selectImage(index: number) {
        this.selectedImageIndex.set(index);
    }

    incrementQty() {
        const p = this.product();
        if (p && this.quantity() < p.stock) {
            this.quantity.update(v => v + 1);
        }
    }

    decrementQty() {
        if (this.quantity() > 1) {
            this.quantity.update(v => v - 1);
        }
    }

    addToCart() {
        const p = this.product();
        if (p && p.stock > 0) {
            this.cartService.addItem(p, this.quantity());
            this.notiService.success(`${p.name} adicionado ao carrinho!`);
        }
    }

    // --- Review Actions ---

    get currentRating() {
        return this.reviewForm.get('rating')?.value || 0;
    }

    setRating(val: number) {
        this.reviewForm.patchValue({ rating: val });
    }

    submitReview() {
        if (this.reviewForm.valid) {
            // Note: Currently creating general shop reviews.
            // To link to specific product, you'd add productId to the request DTO.
            this.reviewService.createPublic(this.reviewForm.value).subscribe({
                next: () => {
                    this.successMessage.set(true);
                    this.showReviewForm.set(false);
                    this.reviewForm.reset({ rating: 5 }); // Reset form, keeping 5 stars default

                    // Hide success message after 5 seconds
                    setTimeout(() => this.successMessage.set(false), 5000);
                },
                error: (err) => {
                    this.notiService.error('Erro ao enviar avaliação. Tente novamente.');
                }
            });
        }
    }
}
