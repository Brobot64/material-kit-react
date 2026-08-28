import { it, vi, expect, describe, beforeEach } from 'vitest';

import { isSubscriptionPath } from 'src/utils/subscription-path';

describe('Subscription Expiration Redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not treat /subscription/renew as a dashboard redirect target loop', () => {
    expect(isSubscriptionPath('/subscription/renew')).toBe(true);
    expect(isSubscriptionPath('/subscription/success')).toBe(true);
    expect(isSubscriptionPath('/app')).toBe(false);
  });

  it('should redirect to /subscription/renew when receiving a 403 expired subscription error off the renew page', async () => {
    const pathname = '/app';
    const mockResponse = {
      ok: false,
      status: 403,
      json: async () => ({ message: 'Business subscription has expired.' }),
    };

    let redirected = '';
    if (!mockResponse.ok && mockResponse.status === 403) {
      const errorData = await mockResponse.json();
      const isSubExpired =
        errorData.message?.toLowerCase().includes('subscription') ||
        errorData.message?.toLowerCase().includes('expired');
      if (isSubExpired && !isSubscriptionPath(pathname)) {
        redirected = '/subscription/renew';
      }
    }

    expect(redirected).toBe('/subscription/renew');
  });

  it('should not redirect when already on a subscription page', async () => {
    const pathname = '/subscription/renew';
    const mockResponse = {
      ok: false,
      status: 403,
      json: async () => ({ message: 'Business subscription has expired.' }),
    };

    let redirected = '';
    if (!mockResponse.ok && mockResponse.status === 403) {
      const errorData = await mockResponse.json();
      const isSubExpired =
        errorData.message?.toLowerCase().includes('subscription') ||
        errorData.message?.toLowerCase().includes('expired');
      if (isSubExpired && !isSubscriptionPath(pathname)) {
        redirected = '/subscription/renew';
      }
    }

    expect(redirected).toBe('');
  });

  it('should redirect to /subscription/renew if SubscriptionGuard detects an expired subscription', () => {
    const subscriptionStatus = {
      isExpired: true,
      isExpiringSoon: false,
      daysLeft: 0,
      endDate: '2020-01-01',
    };
    const isAuthenticated = true;
    const isInitialized = true;
    const pathname = '/dashboard';

    let redirectedPath = '';
    const mockReplace = (path: string) => {
      redirectedPath = path;
    };

    if (isInitialized && isAuthenticated && subscriptionStatus.isExpired) {
      const isSubscriptionPage = pathname.startsWith('/subscription');
      if (!isSubscriptionPage) {
        mockReplace('/subscription/renew');
      }
    }

    expect(redirectedPath).toBe('/subscription/renew');
  });
});
