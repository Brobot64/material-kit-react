export interface Product {
  _id: string;
  businessId: string;
  name: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  unit: string;
  taxRate?: number;
  categoryId?: string | { _id: string; name: string };
  description?: string;
  hasVariants: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOutlet {
  _id: string;
  productId: string | Product;
  outletId: string | { _id: string; name: string };
  businessId?: string;
  isActive: boolean;

  // Pricing
  sellingPrice?: number;
  floorPrice?: number;
  guidePrice?: number;
  defaultSalePrice?: number;
  currentCost?: number;
  averageCost?: number;
  lastPurchaseCost?: number;

  // Inventory
  quantity: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  minStock?: number;
  maxStock?: number;
  reorderLevel?: number;

  // Pricing controls
  allowBelowFloorWithApproval?: boolean;
  allowManualPriceAboveGuide?: boolean;
  requiresReasonBelowGuide?: boolean;

  // Computed display fields (populated by API)
  name?: string;
  sku?: string;
  unit?: string;
  cost?: number;
  price?: number;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface AssignProductToOutletPayload {
  productId: string;
  outletId: string;
  sellingPrice?: number;
  floorPrice?: number;
  guidePrice?: number;
  defaultSalePrice?: number;
  costPrice?: number;
  minStock?: number;
  quantity?: number;
  allowBelowFloorWithApproval?: boolean;
  requiresReasonBelowGuide?: boolean;
}
