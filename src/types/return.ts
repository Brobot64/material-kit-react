export type ReturnStatus =
  | 'received'
  | 'sent_to_distributor'
  | 'received_from_distributor'
  | 'customer_notified'
  | 'completed'
  | 'refunded'
  | 'cancelled';

export type WarrantyStatus = 'under_warranty' | 'out_of_warranty' | 'unknown';
export type ReturnResolution = 'repaired' | 'replaced' | 'refunded' | 'no_fault_found' | 'pending';

export interface ReturnTimelineEntry {
  status: ReturnStatus;
  note?: string;
  actorId: string;
  actorName?: string;
  timestamp: string;
}

export interface ProductReturn {
  _id: string;
  businessId: string;
  outletId: string | { _id: string; name: string };
  returnNumber: string;
  originalSaleId: string | { _id: string; saleNumber?: string; total?: number; createdAt?: string };
  originalSaleItemId: string;
  customerId?: string | { _id: string; fullName?: string; phone?: string };
  customerName?: string;
  customerPhone?: string;
  productId: string | { _id: string; name: string; sku?: string };
  productNameSnapshot: string;
  skuSnapshot?: string;
  serialNumber?: string;
  faultDescription: string;
  warrantyStatus: WarrantyStatus;
  status: ReturnStatus;
  resolution: ReturnResolution;
  distributorName?: string;
  distributorContact?: string;
  sentToDistributorAt?: string;
  distributorReferenceNo?: string;
  receivedFromDistributorAt?: string;
  distributorNotes?: string;
  customerNotifiedAt?: string;
  completedAt?: string;
  refundAmount?: number;
  refundMethod?: string;
  refundedAt?: string;
  timeline: ReturnTimelineEntry[];
  receivedBy: string | { _id: string; fullName?: string; firstName?: string; lastName?: string };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnPayload {
  businessId: string;
  outletId: string;
  originalSaleId: string;
  originalSaleItemId: string;
  serialNumber?: string;
  faultDescription: string;
  warrantyStatus?: WarrantyStatus;
  notes?: string;
}
