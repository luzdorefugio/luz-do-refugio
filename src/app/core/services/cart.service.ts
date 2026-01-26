import { Injectable, signal, computed, effect } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
    private storageKey = 'carrinho_luz';
    cartItems = signal<CartItem[]>(this.loadFromStorage());
    isCartOpen = signal(false);
    totalItemsCount = computed(() =>
        this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
    );
    subTotal = computed(() =>
        this.cartItems().reduce((acc, item) => acc + (item.price * item.quantity), 0)
    );

    constructor() {
        effect(() => {
            const items = this.cartItems();
            localStorage.setItem(this.storageKey, JSON.stringify(items));
        });
    }

    addItem(product: any, quantity: number = 1) {
        const currentItems = this.cartItems();
        const existingItem = currentItems.find(i => i.productId === product.id);

        if (existingItem) {
            this.updateQuantity(product.id, existingItem.quantity + quantity);
        } else {
            // Se é novo, adiciona à lista
            this.cartItems.set([...currentItems, {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                stock: product.stock,
                weightGrams: product.weightGrams,
                price: product.salePrice || product.price,
                quantity: quantity
            }]);
        }
        this.isCartOpen.set(true);
    }

    updateQuantity(productId: number, quantity: number) {
        this.cartItems.update(items => items.map(item => {
            if (item.productId === productId) {
                const safeQuantity = quantity > item.stock ? item.stock : quantity;
                return { ...item, quantity: Math.max(1, safeQuantity) };
            }
            return item;
        }));
    }

    removeItem(productId: number) {
        this.cartItems.update(items => items.filter(i => i.productId !== productId));
    }

    clearCart() {
        this.cartItems.set([]);
    }

    toggleCart() {
        this.isCartOpen.update(val => !val);
    }

    private loadFromStorage(): CartItem[] {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }
}
