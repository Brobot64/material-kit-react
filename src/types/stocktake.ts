export type StocktakeStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'CANCELLED';

export interface Stocktake {
  _id: string;
  businessId: string;
  outletId: string | { _id: string; name: string };
  status: StocktakeStatus;
  snapshotAt?: string;
  completedAt?: string;
  completedBy?: string;
  initiatedBy: string | { _id: string; firstName: string; lastName: string };
  notes?: string;
  totalItems: number;
  countedItems: number;
  varianceCount: number;
  totalVarianceValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface StocktakeItem {
  _id: string;
  stocktakeId: string;
  productId: string | { _id: string; name: string; sku?: string; barcode?: string };
  productName: string;
  sku?: string;
  expectedQty: number;
  countedQty?: number;
  variance?: number;
  unitCost: number;
  varianceValue?: number;
  countedBy?: string;
  countedAt?: string;
  approved: boolean;
  notes?: string;
}
