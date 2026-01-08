export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';

export interface Promotion {
  id: string;
  code: string;           // ex: VERAO2026
  description?: string;
  specialCondition: string;
  discountType: DiscountType;
  discountValue: number;  // 10.00
minOrderAmount: number;
  // Contadores
  usageLimit?: number;
  usedCount: number;

  // Validade
  startDate?: string;
  endDate?: string;
  active: boolean;
}
