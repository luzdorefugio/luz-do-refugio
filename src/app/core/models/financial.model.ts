export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionCategory =
  | 'PRODUCT_SALE'
  | 'MATERIAL_PURCHASE'
  | 'SHIPPING_COST'
  | 'PACKAGING_COST'
  | 'OPERATIONAL'
  | 'ADJUSTMENT';

export interface Financial {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  transactionDate: string; // Vem como string do Java (YYYY-MM-DD)
  referenceId?: string;
  createdBy: string;
  createdAt: string;
}
