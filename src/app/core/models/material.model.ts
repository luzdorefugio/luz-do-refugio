export interface Material {
    id: string;
    sku: string;
    name: string;
    description: string;
    type?: string;
    unit: string;
    minStockLevel: number;
    averageCost: number;
    quantityOnHand: number;
    costPerUnit?: number;
    active: boolean;
}
