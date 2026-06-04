import type { Category } from 'src/types';
import type { Sale, CreateSalePayload } from 'src/types/sale';
import type { AssignProductToOutletPayload } from 'src/types/product';
import type { Swap, SwapStatus, CreateSwapPayload } from 'src/types/swap';
import type { ReturnStatus, ProductReturn, CreateReturnPayload } from 'src/types/return';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';

// ----------------------------------------------------------------------

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('accessToken');

  const isFormData = options?.body instanceof FormData;

  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  if (!isFormData && !headers['Content-Type' as keyof HeadersInit]) {
    (headers as any)['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && !url.includes('/auth/login')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('appData');
      window.location.href = '/sign-in';
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.message?.toLowerCase().includes('subscription') || errorData.message?.toLowerCase().includes('expired')) {
        const businessId = errorData.data?.businessId || '';
        const userId = errorData.data?.userId || '';
        window.location.href = `/subscription/renew?businessId=${businessId}&userId=${userId}`;
      }
      throw new Error(errorData.message || `Access Denied: ${response.statusText}`);
    }

    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// ----------------------------------------------------------------------

export const api = {
  // Auth
  login: (data: any) =>
    request<{ accessToken: string; user: any; appData: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: any) =>
    request<{ userId: string; message: string }>('/auth/register/shopmaster', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyOtp: (data: any) =>
    request<{ message: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resendOtp: (data: any) =>
    request<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  forgotPassword: (data: { email: string }) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resetPassword: (data: { email: string; otp: string; newPassword: any }) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  changePassword: (data: any) =>
    request<{ message: string }>('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  toggleTheme: () =>
    request<{ message: string }>('/auth/toggle-theme', {
      method: 'POST',
    }),

  // Teams
  getTeams: () => request<{ teams: any[] }>('/teams'),
  getTeam: (id: string) => request<{ team: any }>(`/teams/${id}`),
  createTeam: (data: any) =>
    request<{ team: any }>('/teams', { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id: string, data: any) =>
    request<{ team: any }>(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeam: (id: string) => request(`/teams/${id}`, { method: 'DELETE' }),
  addTeamMember: (teamId: string, userId: string, role: string) =>
    request(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify({ userId, role }) }),
  removeTeamMember: (teamId: string, memberId: string) =>
    request(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' }),

  // Projects
  getProjects: (teamId?: string) =>
    request<{ projects: any[] }>(teamId ? `/teams/${teamId}/projects` : '/projects'),
  getProject: (id: string) => request<{ project: any }>(`/projects/${id}`),
  createProject: (data: any) =>
    request<{ project: any }>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) =>
    request<{ project: any }>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
  addProjectMember: (projectId: string, userId: string, role: string) =>
    request(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    }),

  // Tasks
  getTasks: (projectId: string) => request<{ tasks: any[] }>(`/projects/${projectId}/tasks`),
  createTask: (projectId: string, data: any) =>
    request<{ task: any }>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTask: (projectId: string, taskId: string, data: any) =>
    request<{ task: any }>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTask: (projectId: string, taskId: string) =>
    request(`/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),

  // Chats
  getChats: () => request<{ chats: any[] }>('/chats'),
  getChat: (id: string) => request<{ chat: any }>(`/chats/${id}`),
  getChatMessages: (chatId: string) => request<{ messages: any[] }>(`/chats/${chatId}/messages`),
  createPrivateChat: (userId: string) =>
    request<{ chat: any }>('/chats/private', { method: 'POST', body: JSON.stringify({ userId }) }),
  createProjectChat: (projectId: string) =>
    request<{ chat: any }>('/chats/project', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    }),

  // Notifications
  getNotifications: () => request<{ notifications: any[] }>('/notifications'),
  markNotificationAsRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsAsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  // Outlets
  getOutlets: (businessId: string) => request<any[]>(`/outlets?businessId=${businessId}`),
  createOutlet: (data: {
    name: string;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
    };
    phone?: string;
    businessId: string;
    isMain?: boolean;
  }) => request<any>('/outlets', { method: 'POST', body: JSON.stringify(data) }),

  // Reporting
  getSalesAnalytics: () => request<any>('/reporting/dashboard/sales'),
  getCategoryPerformance: (params: { year?: number; month?: number; outletId?: string }) => {
    const query = new URLSearchParams();
    if (params.year) query.append('year', params.year.toString());
    if (params.month) query.append('month', params.month.toString());
    if (params.outletId) query.append('outletId', params.outletId);
    return request<any[]>(`/reporting/category-performance?${query.toString()}`);
  },
  getFinancialOverview: (params: { startDate?: string; endDate?: string; outletId?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return request<any>(`/reporting/financial-overview?${query.toString()}`);
  },
  getIncomeExpenseGraph: (params: { period?: string; outletId?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return request<any[]>(`/reporting/graphs/income-expense?${query.toString()}`);
  },
  getExpenseBreakdownGraph: (params: { outletId?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return request<any[]>(`/reporting/graphs/expense-breakdown?${query.toString()}`);
  },

  // Audit Logs
  getAuditLogs: (params: {
    action?: string;
    performedTo?: string;
    outletId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return request<{ data: any[]; pagination: any }>(`/audit-logs?${query.toString()}`);
  },

  // Products
  getProducts: (params: {
    businessId: string;
    page?: number;
    limit?: number;
    includeVariants?: boolean;
  }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return request<{ data: any[]; pagination: any }>(`/products?${query.toString()}`);
  },

  // Categories
  getCategories: (businessId: string) => request<Category[]>(`/categories?businessId=${businessId}`),
  addCategory: (data: {
    businessId: string;
    name: string;
    description?: string;
    parentId?: string;
  }) => {
    const query = new URLSearchParams({ businessId: data.businessId });
    return request<Category>(`/categories?${query.toString()}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateCategory: (
    id: string,
    data: {
      name?: string;
      description?: string;
      parentId?: string;
      isActive?: boolean;
    }
  ) => request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getProduct: (id: string) => request<any>(`/products/${id}`),
  updateProduct: (id: string, data: any) =>
    request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  addProduct: (data: {
    businessId: string;
    outletId: string;
    name: string;
    barcode?: string;
    brand?: string;
    unit: string;
    taxRate: number;
    categoryId?: string;
    description?: string;
    details?: any;
    hasVariants: boolean;
    images?: string[];
    isActive: boolean;
  }) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  getVariants: (productId: string) => request<any[]>(`/products/variants/${productId}`),
  addVariant: (
    productId: string,
    data: {
      name: string;
      outletId: string;
      unit: string;
      taxRate: number;
      barcode?: string;
      brand?: string;
      description?: string;
      details?: any;
    }
  ) =>
    request<any>(`/products/variants/${productId}`, { method: 'POST', body: JSON.stringify(data) }),
  assignProductToOutlet: (data: AssignProductToOutletPayload) =>
    request<any>('/product-outlets/assign', { method: 'POST', body: JSON.stringify(data) }),
  updateProductOutlet: (productId: string, outletId: string, data: any) =>
    request<any>(`/product-outlets/${productId}/${outletId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateProductOutletPrice: (productId: string, outletId: string, data: {
    sellingPrice?: number;
    floorPrice?: number;
    guidePrice?: number;
    defaultSalePrice?: number;
    costPrice?: number;
    minStock?: number;
  }) =>
    request<any>(`/product-outlets/${productId}/${outletId}/price`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Product Upload
  getProductUploadHeaders: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<string[]>('/products/upload/headers', {
      method: 'POST',
      body: formData,
    });
  },
  executeProductUpload: (data: {
    businessId: string;
    outletId: string;
    mapping: any;
    file: File;
  }) => {
    const formData = new FormData();
    formData.append('businessId', data.businessId);
    formData.append('outletId', data.outletId);
    formData.append('mapping', JSON.stringify(data.mapping));
    formData.append('file', data.file);
    return request<{ imported: number; errors: any[] }>('/products/upload/execute', {
      method: 'POST',
      body: formData,
    });
  },

  // Sales
  getProductOutlets: (params: { outletId: string; page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    const { outletId, ...rest } = params;
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    const queryString = query.toString();
    return request<any>(`/product-outlets/outlet/${outletId}${queryString ? `?${queryString}` : ''}`);
  },
  // unitPrice is the negotiated price per line — this is the correct field name (was 'price', now 'unitPrice')
  createSale: (data: CreateSalePayload) =>
    request<{ data: Sale }>('/sales', { method: 'POST', body: JSON.stringify(data) }),
  addSalePayment: (saleId: string, data: { amount: number; paymentMethod: string; notes?: string }) =>
    request<any>(`/sales/${saleId}/payments`, { method: 'POST', body: JSON.stringify(data) }),
  getSalesHistory: (params: {
    outletId?: string;
    cashierId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') query.append(key, value.toString());
    });
    return request<any>(`/sales/history?${query.toString()}`);
  },
  getPendingSales: (params: { outletId?: string; customerId?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return request<any>(`/sales/pending?${query.toString()}`);
  },

  // Customers
  getCustomers: (params: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return request<{ data: any[]; pagination: any }>(`/customers?${query.toString()}`);
  },
  getCustomer: (id: string) => request<any>(`/customers/${id}`),
  createCustomer: (data: {
    fullName: string;
    phone: string;
    email?: string;
    notes?: string;
    tags?: string[];
  }) => request<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: { notes?: string; tags?: string[]; isActive?: boolean }) =>
    request<any>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deactivateCustomer: (id: string) => request<any>(`/customers/${id}`, { method: 'DELETE' }),

  // Employees
  getEmployees: (params: {
    outletId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return request<{ data: any[]; pagination: any }>(`/employees?${query.toString()}`);
  },
  getEmployee: (id: string) => request<any>(`/employees/${id}`),
  onboardEmployee: (data: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    salary: number;
    position: string;
    businessId: string;
    outletId: string;
  }) => request<any>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id: string, data: { salary?: number; position?: string }) =>
    request<any>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEmployee: (id: string) => request<any>(`/employees/${id}`, { method: 'DELETE' }),
  updateEmployeeStatus: (data: { userId: string; status: string; isActive: boolean }) =>
    request<any>('/employees/status', { method: 'PATCH', body: JSON.stringify(data) }),
  updateEmployeePassword: (data: any) =>
    request<any>('/employees/update-password', { method: 'POST', body: JSON.stringify(data) }),

  // Subscription
  getProfile: () => request<{ user: any; settings: any; appData?: any }>('/auth/profile'),
  updateProfile: (data: any) =>
    request<any>('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  createCheckoutSession: (data: any) => request<{ sessionId: string; url: string }>('/public/checkout-session', { method: 'POST', body: JSON.stringify(data) }),
  getPublicCheckoutSession: (sessionId: string) => request<any>(`/public/checkout-session/${sessionId}`),
  renewSubscription: (data: any) => request<any>('/public/renew-subscription', { method: 'POST', body: JSON.stringify(data) }),

  // Salaries
  getLedgerAccounts: () => request<any[]>('/ledger/accounts'),

  createCredit: (data: { amount: number; description: string; paymentMethod: string; ledgerAccountId?: string }) =>
    request<any>('/transactions/credit', { method: 'POST', body: JSON.stringify(data) }),

  createDebit: (data: { amount: number; description: string; paymentMethod: string; ledgerAccountId?: string }) =>
    request<any>('/transactions/debit', { method: 'POST', body: JSON.stringify(data) }),

  getTransactions: (params: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    outletId?: string;
  }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return request<any>(`/transactions?${query.toString()}`);
  },

  getQuickSummary: () => request<any>('/transactions/quick-summary'),

  paySalary: (data: {
    employeeId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  }) => request<any>('/expenditures/salaries', { method: 'POST', body: JSON.stringify(data) }),
  createExpenditure: (data: {
    source: string;
    amount: number;
    receivedFrom: string;
    paymentMethod: string;
    ledgerAccountId: string;
    notes?: string;
  }) => request<any>('/expenditures', { method: 'POST', body: JSON.stringify(data) }),

  // Outlet management
  updateOutlet: (id: string, data: {
    name?: string;
    address?: { street?: string; city?: string; state?: string; country?: string };
    phone?: string;
    isActive?: boolean;
  }) => request<any>(`/outlets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Stock / Inventory
  receiveStock: (data: {
    businessId: string;
    outletId: string;
    productId: string;
    quantity: number;
    unitCost: number;
    notes?: string;
  }) => request<any>('/stock/movements', {
    method: 'POST',
    body: JSON.stringify({ ...data, type: 'purchase', totalCost: data.quantity * data.unitCost }),
  }),
  adjustStock: (data: {
    businessId: string;
    outletId: string;
    productId: string;
    quantity: number;
    type: 'adjustment' | 'damage';
    reasonCode: string;
    notes?: string;
    unitCost?: any;
  }) => request<any>('/stock/movements', { method: 'POST', body: JSON.stringify(data) }),
  getStockMovements: (params: {
    businessId?: string;
    outletId?: string;
    productId?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
    });
    return request<{ data: any[]; pagination: any }>(`/stock/movements?${query.toString()}`);
  },

  // Receipt
  getReceiptData: (saleId: string, businessId: string) =>
    request<{ data: any }>(`/sales/${saleId}/receipt?businessId=${businessId}`),
  downloadReceiptPdf: async (saleId: string, businessId: string): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    const url = `${API_BASE_URL}/sales/${saleId}/receipt/pdf?businessId=${businessId}`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to download PDF');
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `receipt-${saleId.slice(-8).toUpperCase()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  },

  // Receipt template
  getReceiptTemplate: (businessId: string, outletId?: string) => {
    const query = new URLSearchParams({ businessId });
    if (outletId) query.append('outletId', outletId);
    return request<any>(`/receipt-template?${query.toString()}`);
  },
  upsertReceiptTemplate: (data: any) =>
    request<any>('/receipt-template', { method: 'PUT', body: JSON.stringify(data) }),

  // Reporting extras
  getSalesOverTime: (params?: { outletId?: string }) => {
    const query = new URLSearchParams();
    if (params?.outletId) query.append('outletId', params.outletId);
    return request<any>(`/reporting/sales-overtime?${query.toString()}`);
  },
  getTopProducts: (params?: { outletId?: string; year?: number; month?: number }) => {
    const query = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.append(k, v.toString()); });
    return request<any[]>(`/reporting/top-products?${query.toString()}`);
  },
  getProfitLoss: (params: { startDate: string; endDate: string; outletId?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.append(k, v.toString()); });
    return request<any>(`/reporting/profit-loss?${query.toString()}`);
  },
  getBalanceSheet: (params: { asOf: string; outletId?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.append(k, v.toString()); });
    return request<any>(`/reporting/balance-sheet?${query.toString()}`);
  },
  getTrialBalance: (params: { startDate: string; endDate: string; outletId?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.append(k, v.toString()); });
    return request<any>(`/reporting/trial-balance?${query.toString()}`);
  },

  // Business Settings
  getBusinessSettings: (businessId: string) =>
    request<any>(`/business-settings?businessId=${businessId}`),
  upsertBusinessSettings: (data: any) =>
    request<any>('/business-settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Stocktake
  initiateStocktake: (data: { businessId: string; outletId: string; notes?: string }) =>
    request<any>('/stocktake', { method: 'POST', body: JSON.stringify(data) }),
  listStocktakes: (params: { businessId: string; outletId?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.append(k, v.toString()); });
    return request<any>(`/stocktake?${query.toString()}`);
  },
  getStocktake: (id: string, businessId: string) =>
    request<any>(`/stocktake/${id}?businessId=${businessId}`),
  updateStocktakeItem: (id: string, data: { productId: string; countedQty: number; notes?: string }, businessId: string) =>
    request<any>(`/stocktake/${id}/items?businessId=${businessId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  submitStocktake: (id: string, businessId: string) =>
    request<any>(`/stocktake/${id}/submit?businessId=${businessId}`, { method: 'POST' }),
  reconcileStocktake: (id: string, businessId: string) =>
    request<any>(`/stocktake/${id}/reconcile?businessId=${businessId}`, { method: 'POST' }),
  cancelStocktake: (id: string, businessId: string) =>
    request<any>(`/stocktake/${id}/cancel?businessId=${businessId}`, { method: 'POST' }),

  // Swaps
  createSwap: (data: CreateSwapPayload) =>
    request<{ data: Swap }>('/swaps', { method: 'POST', body: JSON.stringify(data) }),
  getSwaps: (params: { businessId: string; outletId?: string; status?: SwapStatus; customerId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.append(k, v.toString()); });
    return request<{ data: Swap[]; total: number; page: number; limit: number }>(`/swaps?${query.toString()}`);
  },
  getSwap: (id: string) => request<{ data: Swap }>(`/swaps/${id}`),
  completeSwap: (id: string) =>
    request<{ data: Swap }>(`/swaps/${id}/complete`, { method: 'POST' }),
  cancelSwap: (id: string) =>
    request<{ data: Swap }>(`/swaps/${id}/cancel`, { method: 'POST' }),

  // Returns
  createReturn: (data: CreateReturnPayload) =>
    request<{ data: ProductReturn }>('/returns', { method: 'POST', body: JSON.stringify(data) }),
  getReturns: (params: { outletId?: string; status?: ReturnStatus; customerId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.append(k, v.toString()); });
    return request<{ data: ProductReturn[]; total: number; page: number; limit: number }>(`/returns?${query.toString()}`);
  },
  getReturn: (id: string) => request<{ data: ProductReturn }>(`/returns/${id}`),
  getSaleWithItems: (saleId: string) => request<{ sale: any; items: any[] }>(`/returns/sale/${saleId}/items`),
  sendToDistributor: (id: string, data: { distributorName: string; distributorContact?: string; distributorReferenceNo?: string; note?: string }) =>
    request<{ data: ProductReturn }>(`/returns/${id}/send-to-distributor`, { method: 'POST', body: JSON.stringify(data) }),
  receiveFromDistributor: (id: string, data: { resolution: 'repaired' | 'replaced' | 'no_fault_found'; distributorNotes?: string; note?: string }) =>
    request<{ data: ProductReturn }>(`/returns/${id}/receive-from-distributor`, { method: 'POST', body: JSON.stringify(data) }),
  notifyCustomer: (id: string, data: { note?: string }) =>
    request<{ data: ProductReturn }>(`/returns/${id}/notify-customer`, { method: 'POST', body: JSON.stringify(data) }),
  completeReturn: (id: string, data: { note?: string }) =>
    request<{ data: ProductReturn }>(`/returns/${id}/complete`, { method: 'POST', body: JSON.stringify(data) }),
  processRefund: (id: string, data: { refundAmount: number; refundMethod: string; note?: string }) =>
    request<{ data: ProductReturn }>(`/returns/${id}/refund`, { method: 'POST', body: JSON.stringify(data) }),
  cancelReturn: (id: string, data: { note?: string }) =>
    request<{ data: ProductReturn }>(`/returns/${id}/cancel`, { method: 'POST', body: JSON.stringify(data) }),

  // Bargaining analytics
  getBargainingAnalytics: (params: { outletId?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) query.append(k, v.toString()); });
    return request<any>(`/reporting/bargaining-analytics?${query.toString()}`);
  },
};
