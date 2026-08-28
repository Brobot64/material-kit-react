import type { User, Outlet, Category } from 'src/types';

import { useState, useEffect, useContext, useCallback, createContext, type ReactNode } from 'react';

import { api } from 'src/services/api';
import { platformAdminApi } from 'src/platform-admin/api/platform-admin-api';
import { isSubscriptionPath } from 'src/utils/subscription-path';
import {
  loadPlatformSession,
  savePlatformSession,
  clearPlatformSession,
  saveImpersonationMeta,
} from 'src/platform-admin/impersonation';

// ----------------------------------------------------------------------

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isImpersonating: boolean;
  login: (data: any) => Promise<User>;
  register: (data: any) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: any) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  onboardEmployee: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  appData: any;
  updateAppData: (updates: any) => void;
  categories: Category[];
  outlets: Outlet[];
  refreshCategories: () => Promise<void>;
  refreshOutlets: () => Promise<void>;
  refreshProfile: () => Promise<any>;
  toggleTheme: () => Promise<void>;
  startImpersonation: (params: {
    businessId: string;
    ownerUserId?: string;
    reason?: string;
  }) => Promise<void>;
  exitImpersonation: () => Promise<void>;
  subscriptionStatus: {
    isExpired: boolean;
    isExpiringSoon: boolean;
    daysLeft: number;
    endDate: string | null;
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // const [workspaces, setWorkspaces] = useState<WorkspacesPopoverProps['data']>([]);

  const [appData, setAppData] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const [isInitialized, setIsInitialized] = useState(false);

  const getSubscriptionStatus = useCallback(() => {
    const endDateStr = appData?.subscriptionEnd;
    if (!endDateStr) {
      const flagged = Boolean(appData?.isExpired || appData?.mustRenewSubscription);
      return { isExpired: flagged, isExpiringSoon: false, daysLeft: 0, endDate: null };
    }

    const endDate = new Date(endDateStr);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      isExpired: diffTime <= 0 || Boolean(appData?.isExpired),
      isExpiringSoon: diffDays > 0 && diffDays <= 5,
      daysLeft: Math.max(0, diffDays),
      endDate: endDateStr,
    };
  }, [appData?.subscriptionEnd, appData?.isExpired, appData?.mustRenewSubscription]);

  const subscriptionStatus = getSubscriptionStatus();

  const shouldSkipTenantBootstrap = useCallback(() => {
    if (typeof window !== 'undefined' && isSubscriptionPath()) {
      return true;
    }
    if (appData?.mustRenewSubscription || appData?.isExpired) {
      return true;
    }
    if (appData?.subscriptionEnd && new Date(appData.subscriptionEnd).getTime() <= Date.now()) {
      return true;
    }
    return false;
  }, [appData?.mustRenewSubscription, appData?.isExpired, appData?.subscriptionEnd]);

  const fetchCategories = useCallback(async () => {
    if (!appData?.businessId || shouldSkipTenantBootstrap()) {
      return;
    }
    try {
      const data = await api.getCategories(appData.businessId);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      try {
        const { readOfflineCollection } = await import('src/offline/read-offline');
        const cached = await readOfflineCollection('categories');
        if (cached.length) setCategories(cached as any);
      } catch {
        /* ignore offline miss */
      }
    }
  }, [appData?.businessId, shouldSkipTenantBootstrap]);

  const fetchOutlets = useCallback(async () => {
    if (!appData?.businessId || shouldSkipTenantBootstrap()) {
      return;
    }
    try {
      const data = await api.getOutlets(appData.businessId);
      setOutlets(data.map((o: any) => ({ ...o, id: o._id })));
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
      try {
        const { readOfflineCollection } = await import('src/offline/read-offline');
        const cached = await readOfflineCollection('outlets');
        if (cached.length) {
          setOutlets(cached.map((o: any) => ({ ...o, id: o._id || o.id })));
        }
      } catch {
        /* ignore offline miss */
      }
    }
  }, [appData?.businessId, shouldSkipTenantBootstrap]);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.getProfile();
      const { user: userData, appData: profileAppData } = response;

      const mappedUser: User = {
        ...userData,
        id: userData._id,
        name: userData.fullName,
        avatar: user?.avatar || '/assets/images/avatar/avatar-25.webp',
      };

      setUser(mappedUser);

      const finalAppData = {
        ...appData,
        ...(profileAppData || {}),
      };

      setAppData(finalAppData);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      localStorage.setItem('appData', JSON.stringify(finalAppData));
      return finalAppData;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      return appData;
    }
  }, [user?.avatar, appData]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  const refreshCategories = async () => {
    await fetchCategories();
  };

  const refreshOutlets = async () => {
    await fetchOutlets();
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedAppData = localStorage.getItem('appData');
        const storedAccessToken = localStorage.getItem('accessToken');

        if (storedAccessToken && storedUser) {
          setUser(JSON.parse(storedUser));
          setAccessToken(storedAccessToken);
        }
        if (storedAppData) {
          setAppData(JSON.parse(storedAppData));
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  const login = async (data: any) => {
    const response = await api.login(data);
    const { user: userData, accessToken: token, appData: loginAppData } = response;

    // Map API user to internal User type if needed
    const mappedUser: User = {
      ...userData,
      // Add compatibility fields
      id: userData._id,
      name: userData.fullName,
      avatar: '/assets/images/avatar/avatar-25.webp', // Default avatar
    };

    setUser(mappedUser);
    setAccessToken(token);
    setAppData(loginAppData);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    localStorage.setItem('appData', JSON.stringify(loginAppData));

    return mappedUser;
  };

  const register = async (data: any) => {
    await api.register(data);
    // Registration successful, usually redirects to OTP or Login
  };

  const verifyOtp = async (email: string, otp: string) => {
    await api.verifyOtp({ email, otp });
    // After verification, we might want to refresh user data or update local state
    if (user && user.email === email) {
      const updatedUser = { ...user, isEmailVerified: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const resendOtp = async (email: string) => {
    await api.resendOtp({ email });
  };

  const forgotPassword = async (email: string) => {
    await api.forgotPassword({ email });
  };

  const resetPassword = async (email: string, otp: string, newPassword: any) => {
    await api.resetPassword({ email, otp, newPassword });
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    await api.changePassword(data);
    if (user) {
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const onboardEmployee = async (data: any) => {
    await api.onboardEmployee(data);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setAppData(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('appData');
    clearPlatformSession();
  };

  const startImpersonation = async (params: {
    businessId: string;
    ownerUserId?: string;
    reason?: string;
  }) => {
    const currentToken = localStorage.getItem('accessToken');
    const currentUser = localStorage.getItem('user');
    const currentAppData = localStorage.getItem('appData');

    if (!currentToken || !currentUser) {
      throw new Error('No platform admin session to preserve');
    }

    savePlatformSession({
      accessToken: currentToken,
      user: JSON.parse(currentUser),
      appData: currentAppData ? JSON.parse(currentAppData) : null,
    });

    const result = await platformAdminApi.impersonate(params);

    const mappedUser: User = {
      ...result.user,
      id: result.user._id || result.user.id,
      name: result.user.fullName || result.user.name,
      avatar: '/assets/images/avatar/avatar-25.webp',
    };

    setUser(mappedUser);
    setAccessToken(result.accessToken);
    setAppData(result.appData);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    localStorage.setItem('appData', JSON.stringify(result.appData));
    saveImpersonationMeta({
      businessId: result.business.id,
      businessName: result.business.name,
      ownerName: result.impersonatedUser.fullName,
      ownerEmail: result.impersonatedUser.email,
    });
  };

  const exitImpersonation = async () => {
    const snapshot = loadPlatformSession();
    try {
      await platformAdminApi.endImpersonation({
        businessId: appData?.businessId,
        targetUserId: user?.id || user?._id,
      });
    } catch {
      // Still restore platform session even if audit end fails
    }

    clearPlatformSession();

    if (!snapshot?.accessToken || !snapshot.user) {
      logout();
      return;
    }

    const restoredUser = snapshot.user as User;
    setUser(restoredUser);
    setAccessToken(snapshot.accessToken);
    setAppData(snapshot.appData);
    localStorage.setItem('accessToken', snapshot.accessToken);
    localStorage.setItem('user', JSON.stringify(restoredUser));
    localStorage.setItem('appData', JSON.stringify(snapshot.appData ?? null));
  };

  const toggleTheme = async () => {
    if (user) {
      const newTheme = user.themePreference === 'dark' ? 'light' : 'dark';

      // Optimistic update
      const updatedUser = { ...user, themePreference: newTheme };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      try {
        await api.toggleTheme();
      } catch (error) {
        console.error('Failed to toggle theme on backend:', error);
        // We probably don't want to revert here since it's just a theme preference,
        // but if we did, we'd set it back to the old value.
      }
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const updateAppData = useCallback((updates: any) => {
    setAppData((prev: any) => {
      const updated = { ...(prev || {}), ...updates };
      localStorage.setItem('appData', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isImpersonating = Boolean(appData?.impersonating || appData?.impersonatedBy);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isInitialized,
        isImpersonating,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        changePassword,
        onboardEmployee,
        logout,
        updateUser,
        appData,
        updateAppData,
        categories,
        outlets,
        refreshCategories,
        refreshOutlets,
        refreshProfile,
        toggleTheme,
        startImpersonation,
        exitImpersonation,
        subscriptionStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
