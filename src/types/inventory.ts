export type MovementType =
  | 'purchase'
  | 'sale'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment'
  | 'damage'
  | 'return_customer'
  | 'return_supplier';

export interface StockMovement {
  _id: string;
  businessId: string;
  outletId: string | { _id: string; name: string };
  productId: string | { _id: string; name: string; sku?: string };
  type: MovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  referenceId?: string;
  referenceType?: string;
  performedBy?: string | { _id: string; fullName?: string };
  notes?: string;
  reasonCode?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  valuationDelta?: number;
  createdAt: string;
}

export interface InventoryBalance {
  _id: string;
  businessId: string;
  outletId: string;
  productId: string | { _id: string; name: string; sku?: string };
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  averageCost: number;
  totalInventoryValue: number;
  lastValuationAt: string;
  lastMovementAt: string;
}

export interface ReceiveStockPayload {
  businessId: string;
  outletId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  sourceType: 'PURCHASE' | 'TRANSFER_IN' | 'RETURN_SUPPLIER' | 'ADJUSTMENT';
  sourceId?: string;
  performedBy?: string;
  notes?: string;
}

export interface AdjustStockPayload {
  businessId: string;
  outletId: string;
  productId: string;
  quantity: number;
  type: 'adjustment' | 'damage';
  reasonCode: string;
  notes?: string;
  performedBy?: string;
}
