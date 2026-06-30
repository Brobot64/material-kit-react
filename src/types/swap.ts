export type SwapStatus = 'pending' | 'completed' | 'cancelled';
export type TradeInCondition = 'excellent' | 'good' | 'fair' | 'poor';

export interface TradeIn {
  productName: string;
  description?: string;
  condition: TradeInCondition;
  estimatedValue: number;
  acceptedValue: number;
  notes?: string;
}

export interface Swap {
  _id: string;
  businessId: string;
  outletId: string | { _id: string; name: string };
  cashierId: string | { _id: string; fullName?: string; firstName?: string; lastName?: string };
  customerId?: string | { _id: string; fullName?: string; phone?: string };
  tradeIn: TradeIn;
  newProductId: string | { _id: string; name: string; sku?: string };
  newProductQty: number;
  newProductUnitPrice: number;
  cashDelta: number;
  subtotal: number;
  status: SwapStatus;
  saleId?: string;
  swapNumber?: string;
  notes?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSwapPayload {
  businessId: string;
  outletId: string;
  customerId?: string;
  tradeIn: {
    productName: string;
    description?: string;
    condition: TradeInCondition;
    estimatedValue: number;
    acceptedValue: number;
    notes?: string;
  };
  newProductId: string;
  newProductQty: number;
  newProductUnitPrice: number;
  notes?: string;
}
