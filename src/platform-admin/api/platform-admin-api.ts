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
  updatedAt?: string;
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

  getUserStats: () =>
    platformRequest<{
      ownersCount: number;
      newUsersWeek: number;
      newUsersMonth: number;
      totalUsers: number;
    }>('/users/stats'),

  getPlans: () => platformRequest<any[]>('/plans'),

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
};
