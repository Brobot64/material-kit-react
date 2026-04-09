export type EmployeeRole = 'owner' | 'outlet_admin' | 'sales_rep';

export type EmployeeUserId = {
  _id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  status: string;
  mustChangePassword: boolean;
  role?: EmployeeRole | string;
};

export type EmployeeOutletId = {
  _id: string;
  name: string;
};

export type Employee = {
  _id: string;
  userId: EmployeeUserId;
  businessId: string;
  outletId: EmployeeOutletId;
  salary: number;
  hireDate: string;
  position: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type EmployeePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
