export interface ShippingMethod {
    id: string;
    name: string;        // ex: "Correio Registado"
    description: string; // ex: "3-5 dias úteis"
    price: number;       // ex: 3.50
    active: boolean;
    displayOrder?: number;
}
