const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';

async function platformRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/platform-admin${endpoint}`;
  const token = localStorage.getItem('accessToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('appData');
      window.location.href = '/sign-in';
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export type PlatformDashboard = {
  activeBusinesses: number;
  newSignupsWeek: number;
  newSignupsMonth: number;
  mrr: number;
  arr: number;
  failedRenewals: number;
  users: {
    ownersCount: number;
    newUsersWeek: number;
    newUsersMonth: number;
  };
  inventory?: {
    totalInventoryValueProcessed: number;
    totalOnHandValue: number;
    movementCount: number;
    range: { startDate: string | null; endDate: string | null };
  };
};

export type PlatformBusinessFeatures = {
  enableBarcode: boolean;
  enableReceiptPrinting: boolean;
  enableLowStockAlerts: boolean;
  lowStockThreshold: number;
  enableExpiryTracking: boolean;
  defaultExpiryNotificationDays: number;
};

export type PlatformBusinessListItem = {
  id: string;
  name: string;
  status: string;
  currency: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  plan: { id: string; name: string; price: number; currency: string; durationInDays: number } | null;
  owner: { id: string; fullName: string; email: string } | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type PlatformBusinessDetail = PlatformBusinessListItem & {
  logo?: string;
  fiscalYearStart?: string;
  counts: { outlets: number; users: number };
  features?: PlatformBusinessFeatures;
  updatedAt?: string;
};

export type PlatformPlan = {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  durationInDays: number;
  maxOutlets: number;
  maxUsers: number;
  maxProducts?: number;
};

export const platformAdminApi = {
  getDashboard: () => platformRequest<PlatformDashboard>('/dashboard'),

  listBusinesses: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return platformRequest<{
      data: PlatformBusinessListItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/businesses${qs ? `?${qs}` : ''}`);
  },

  getBusiness: (id: string) => platformRequest<PlatformBusinessDetail>(`/businesses/${id}`),

  updateStatus: (id: string, status: string) =>
    platformRequest<PlatformBusinessDetail>(`/businesses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  extendTrial: (id: string, days: number) =>
    platformRequest<PlatformBusinessDetail>(`/businesses/${id}/extend-trial`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    }),

  markPaid: (id: string, body?: { amount?: number; paymentMethod?: string; paymentReference?: string }) =>
    platformRequest<{ success: boolean; message: string; business: PlatformBusinessDetail }>(
      `/businesses/${id}/mark-paid`,
      { method: 'POST', body: JSON.stringify(body || {}) }
    ),

  updateFeatures: (id: string, features: Partial<PlatformBusinessFeatures>) =>
    platformRequest<PlatformBusinessDetail>(`/businesses/${id}/features`, {
      method: 'PATCH',
      body: JSON.stringify({ features }),
    }),

  getInventoryMetrics: (params?: { startDate?: string; endDate?: string; refresh?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.startDate) q.set('startDate', params.startDate);
    if (params?.endDate) q.set('endDate', params.endDate);
    if (params?.refresh) q.set('refresh', '1');
    const qs = q.toString();
    return platformRequest<{
      totalInventoryValueProcessed: number;
      totalOnHandValue: number;
      movementCount: number;
      inboundValue: number;
      outboundValue: number;
      totalQuantityOnHand: number;
      range: { startDate: string | null; endDate: string | null };
      cached: boolean;
      computedAt: string;
    }>(`/inventory/metrics${qs ? `?${qs}` : ''}`);
  },

  getPlans: () => platformRequest<PlatformPlan[]>('/plans'),

  createPlan: (body: Partial<PlatformPlan> & { name: string; price: number }) =>
    platformRequest<PlatformPlan>('/plans', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updatePlan: (id: string, body: Partial<PlatformPlan>) =>
    platformRequest<PlatformPlan>(`/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deletePlan: (id: string) =>
    platformRequest<void>(`/plans/${id}`, { method: 'DELETE' }),

  previewEmailAudience: (audience: 'all_owners' | 'active' | 'expired') =>
    platformRequest<{
      audience: string;
      recipientCount: number;
      sample: Array<{ email: string; fullName: string }>;
    }>(`/email/audience?audience=${audience}`),

  sendBulkEmail: (body: {
    audience: 'all_owners' | 'active' | 'expired';
    subject: string;
    body: string;
  }) =>
    platformRequest<{
      audience: string;
      recipientCount: number;
      sent: number;
      failed: number;
      failures: Array<{ email: string; reason: string }>;
    }>('/email/bulk', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getUserStats: () =>
    platformRequest<{
      ownersCount: number;
      newUsersWeek: number;
      newUsersMonth: number;
      totalUsers: number;
    }>('/users/stats'),

  impersonate: (body: { businessId: string; ownerUserId?: string; reason?: string }) =>
    platformRequest<{
      accessToken: string;
      expiresIn: string;
      jti: string;
      business: { id: string; name: string };
      impersonatedUser: { id: string; fullName: string; email: string; role: string };
      appData: any;
      user: any;
    }>('/impersonate', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  endImpersonation: (body?: { businessId?: string; targetUserId?: string; reason?: string }) =>
    platformRequest<{ success: boolean }>('/impersonate/end', {
      method: 'POST',
      body: JSON.stringify(body || {}),
    }),

  listTickets: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    businessId?: string;
    priority?: string;
    search?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    if (params?.businessId) q.set('businessId', params.businessId);
    if (params?.priority) q.set('priority', params.priority);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return platformRequest<{
      data: PlatformTicketListItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/tickets${qs ? `?${qs}` : ''}`);
  },

  getTicket: (id: string) => platformRequest<PlatformTicketDetail>(`/tickets/${id}`),

  createTicket: (body: {
    businessId: string;
    subject: string;
    body?: string;
    priority?: string;
    channel?: string;
    assigneeId?: string;
  }) =>
    platformRequest<PlatformTicketDetail>('/tickets', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateTicketStatus: (id: string, status: string) =>
    platformRequest<PlatformTicketDetail>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  assignTicket: (id: string, assigneeId: string | null) =>
    platformRequest<PlatformTicketDetail>(`/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigneeId }),
    }),

  addTicketMessage: (id: string, body: string) =>
    platformRequest<PlatformTicketDetail>(`/tickets/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
};

export type PlatformTicketListItem = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  channel: string;
  business: { id: string; name: string | null } | null;
  createdBy: { id: string; fullName: string; email: string } | null;
  assignee: { id: string; fullName: string; email: string } | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlatformTicketMessage = {
  id: string;
  ticketId: string;
  authorType: 'platform' | 'tenant';
  body: string;
  author: { id: string; fullName: string; email: string } | null;
  createdAt: string;
};

export type PlatformTicketDetail = PlatformTicketListItem & {
  messageCount?: number;
  messages: PlatformTicketMessage[];
};
