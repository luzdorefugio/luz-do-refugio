export interface ProductRecipe {
    materialId: string;    // UUID do material
    quantity: number;      // Quanto gasta
    materialName?: string; // (Frontend only) Para mostrar na lista
    sku?: string;          // (Frontend only) Para referência
    unit?: string;         // (Frontend only) kg, g, l
    costPerUnit?: number;  // (Frontend only) Para calcular totais
}

// 2. Definição do Produto (Com a receita lá dentro)
export interface Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    price: number;
    maxProduction: number;
    stock: number;
    estimatedCost: number;
    burnTime: string;
    intensity: number;
    topNote: string;
    heartNote: string;
    baseNote: string;
    activeShop: boolean;
    active: boolean;

   // AQUI ESTÁ ELA: A lista de itens faz parte do produto
   recipeItems: ProductRecipe[];
}
