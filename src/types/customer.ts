export interface Customer {
  _id: string;
  businessId: string;
  fullName: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Receivable {
  _id: string;
  customerId: string | Customer;
  businessId: string;
  outletId: string;
  sourceSaleId: string;
  originalAmount: number;
  outstandingAmount: number;
  dueDate?: string;
  status: 'OPEN' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'WRITTEN_OFF';
  createdAt: string;
}

export interface AgingBucket {
  label: string;
  minDays: number;
  maxDays: number | null;
  totalOutstanding: number;
  count: number;
}
