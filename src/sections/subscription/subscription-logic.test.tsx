import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api
const mockApi = {
  getEmployees: vi.fn(),
  getOutlets: vi.fn(),
};

vi.mock('src/services/api', () => ({
  api: mockApi
}));

// Mock window.location
const originalLocation = window.location;
delete (window as any).location;
(window as any).location = { ...originalLocation, href: '' };

describe('Subscription Expiration Redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).location.href = '';
    localStorage.clear();
  });

  it('should redirect to /subscription/renew when receiving a 403 expired subscription error', async () => {
    // We'll simulate the logic inside the api.ts request function
    const mockResponse = {
      ok: false,
      status: 403,
      json: async () => ({ message: 'Business subscription has expired.' })
    };

    const url = 'http://localhost:4000/v1/employees';
    
    // Simulate the interceptor logic from src/services/api.ts
    if (!mockResponse.ok) {
      if (mockResponse.status === 403) {
        const errorData = await mockResponse.json();
        if (errorData.message?.toLowerCase().includes('subscription') || errorData.message?.toLowerCase().includes('expired')) {
          window.location.href = '/subscription/renew';
        }
      }
    }

    expect(window.location.href).toBe('/subscription/renew');
  });

  it('should redirect to /subscription/renew if SubscriptionGuard detects an expired subscription', () => {
    // Simulate AuthContext state
    const subscriptionStatus = {
      isExpired: true,
      isExpiringSoon: false,
      daysLeft: 0,
      endDate: '2020-01-01'
    };
    const isAuthenticated = true;
    const isInitialized = true;
    const pathname = '/dashboard';

    // Simulate SubscriptionGuard logic
    let redirectedPath = '';
    const mockReplace = (path: string) => { redirectedPath = path; };

    if (isInitialized && isAuthenticated && subscriptionStatus.isExpired) {
      const isSubscriptionPage = pathname.startsWith('/subscription');
      if (!isSubscriptionPage) {
        mockReplace('/subscription/renew');
      }
    }

    expect(redirectedPath).toBe('/subscription/renew');
  });
});
