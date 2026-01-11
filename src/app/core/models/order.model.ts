export interface OrderItem {
    productId?: string;
    productName: string;
    sku: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    createdAt: string;
    channel?: 'WEBSITE' | 'INSTAGRAM' | 'FACEBOOK' | 'BASKET' | 'MARKET_STALL' | 'DIRECT';
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerNif?: string;
    address: string;
    city: string;
    zipCode: string;
    shippingMethod: string;
    shippingCost: number;
    appliedPromotionCode: string;
    discountAmount: number;
    paymentMethod: 'MBWAY' | 'TRANSFER' | string;
    totalAmount: number;
    status: string;
    withoutBox: boolean;
    withoutCard: boolean;
    invoiceIssued: boolean;
    items: OrderItem[];
}
