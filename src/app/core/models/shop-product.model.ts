export interface ShopProduct {
    id: string;
    sku: string;
    name: string;
    description: string;
    salePrice: number;
    stock: number;
    burnTime: string;
    intensity: number;
    topNote: string;
    heartNote: string;
    baseNote: string;
    featured: boolean;
}
