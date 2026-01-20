export interface OrderItem {
    productId: string;
    productName: string;
    sku?: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    createdAt: string; // Ou Date, se preferires converter
    channel: 'WEBSITE' | 'INSTAGRAM' | 'FACEBOOK' | 'BASKET' | 'MARKET_STALL' | 'DIRECT';
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

    // --- DADOS DO CLIENTE / COMPRADOR ---
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerNif?: string;

    // --- MORADA DE ENVIO (Física) ---
    address: string;
    city: string;
    zipCode: string;

    // --- NOVA: MORADA DE FATURAÇÃO (Fiscal) ---
    // Opcionais (?) porque podem vir a null se for igual à de envio
    billingAddress?: string;
    billingCity?: string;
    billingZipCode?: string;

    // --- NOVA: DETALHES DE LOGÍSTICA ---
    shippingMethod: string;
    shippingCost: number;

    // --- PAGAMENTOS E TOTAIS ---
    paymentMethod: 'MBWAY' | 'TRANSFER' | 'NUMERARIO' | string;
    totalAmount: number;
    appliedPromotionCode?: string;
    discountAmount?: number;

    // --- OPÇÕES EXTRA ---
    withoutBox: boolean;
    withoutCard: boolean;
    invoiceIssued: boolean;
    // --- NOVA: DETALHES DE OFERTA (GIFT) ---
    isGift?: boolean;
    giftMessage?: string;
    giftFromName?: string;
    giftToName?: string;
    items: OrderItem[];
}
