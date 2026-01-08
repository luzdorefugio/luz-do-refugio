export interface StockMovement {
  id: string; // ou UUID
  materialName: string;
  type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'RETURN'; // Tipos que vêm do Enum Java
  quantity: number;
  notes?: string; // Pode ser null
  timestamp: string;    // Timestamp do Java
  userName?: string;
}
