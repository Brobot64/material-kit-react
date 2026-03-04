import type { Category } from 'src/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';

// ----------------------------------------------------------------------

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('accessToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
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
  markNotificationAsRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsAsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Outlets
  getOutlets: (businessId: string) => request<any[]>(`/outlets?businessId=${businessId}`),

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
  assignProductToOutlet: (data: {
    productId: string;
    outletId: string;
    sellingPrice: number;
    costPrice: number;
    minStock: number;
    quantity: number;
  }) => request<any>('/product-outlets/assign', { method: 'POST', body: JSON.stringify(data) }),

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
  createSale: (data: {
    items: {
      productId: string;
      quantity: number;
      price?: number;
      tax?: number;
      discount?: number;
    }[];
    paymentMethod: string;
    amountPaid: number;
    customerId?: string;
    paymentDeadline?: string;
    notes?: string;
  }) => request<any>('/sales', { method: 'POST', body: JSON.stringify(data) }),
  addSalePayment: (saleId: string, data: { amount: number; paymentMethod: string; notes?: string }) =>
    request<any>(`/sales/${saleId}/payments`, { method: 'POST', body: JSON.stringify(data) }),
  getSalesHistory: (params: {
    outletId?: string;
    cashierId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.append(key, value.toString());
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
  createEmployee: (data: {
    fullName: string;
    email: string;
    phone: string;
    role: string;
    salary: number;
    position: string;
    outletId: string;
  }) => request<any>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id: string, data: { salary?: number; position?: string }) =>
    request<any>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEmployee: (id: string) => request<any>(`/employees/${id}`, { method: 'DELETE' }),
  updateEmployeeStatus: (data: { userId: string; status: string; isActive: boolean }) =>
    request<any>('/employees/status', { method: 'PATCH', body: JSON.stringify(data) }),
  updateEmployeePassword: (data: any) =>
    request<any>('/employees/update-password', { method: 'POST', body: JSON.stringify(data) }),

  // Salaries
  paySalary: (data: {
    employeeId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  }) => request<any>('/expenditures/salaries', { method: 'POST', body: JSON.stringify(data) }),
};
