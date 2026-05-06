export type SaleStatus = 'completed' | 'partially_paid' | 'pending' | 'overdue' | 'void';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'credit';
export type PricingDecision = 'AT_DEFAULT' | 'AT_GUIDE' | 'BELOW_GUIDE' | 'ABOVE_GUIDE' | 'BELOW_FLOOR_APPROVED';

export interface SaleItem {
  _id: string;
  saleId: string;
  productId: string | { _id: string; name: string; sku?: string };
  outletId?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  costAtSale: number;
  guidePriceAtSale?: number;
  floorPriceAtSale?: number;
  defaultSalePriceAtSale?: number;
  lineSubtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  lineTotal?: number;
  grossMarginAmount?: number;
  grossMarginPercent?: number;
  pricingDecision?: PricingDecision;
  overrideReason?: string;
  productNameSnapshot?: string;
  skuSnapshot?: string;
}

export interface Sale {
  _id: string;
  businessId: string;
  outletId: string | { _id: string; name: string };
  cashierId: string | { _id: string; fullName?: string; firstName?: string; lastName?: string };
  customerId?: string | { _id: string; fullName?: string; name?: string; phone?: string };
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  amountPending: number;
  paymentMethod: PaymentMethod;
  paymentDeadline?: string;
  paymentRemark?: string;
  status: SaleStatus;
  isReturn: boolean;
  notes?: string;
  saleNumber?: string;
  grandTotal?: number;
  changeGiven?: number;
  postedToLedger?: boolean;
  saleChannel?: 'POS' | 'ONLINE' | 'PHONE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  tax?: number;
  discount?: number;
  overrideReason?: string;
}

export interface CreateSalePayload {
  businessId: string;
  outletId: string;
  items: CreateSaleItem[];
  paymentMethod: PaymentMethod;
  amountPaid: number;
  customerId?: string;
  paymentDeadline?: string;
  notes?: string;
}
