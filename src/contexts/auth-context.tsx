import type { User, Outlet, Category } from 'src/types';

import { useUser, useAuth as useClerkAuth } from '@clerk/react';
import {
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
  type ReactNode,
} from 'react';

import { api } from 'src/services/api';

// ----------------------------------------------------------------------

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
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
  categories: Category[];
  outlets: Outlet[];
  refreshCategories: () => Promise<void>;
  refreshOutlets: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  subscriptionStatus: {
    isExpired: boolean;
    isExpiringSoon: boolean;
    daysLeft: number;
    endDate: string | null;
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787/v1';
const NOOP_ASYNC = async () => {};

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Clerk-backed auth. Identity/session come from Clerk; the app profile,
 * active business and role come from the Worker's GET /v1/auth/me. The
 * public useAuth() shape is preserved so existing pages/guards keep working.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();

  const [user, setUser] = useState<User | null>(null);
  const [appData, setAppData] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [profileSettled, setProfileSettled] = useState(false);

  const getSubscriptionStatus = useCallback(() => {
    const endDateStr = appData?.subscriptionEnd;
    if (!endDateStr) {
      return { isExpired: false, isExpiringSoon: false, daysLeft: 0, endDate: null };
    }
    const endDate = new Date(endDateStr);
    const diffTime = endDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      isExpired: diffTime <= 0,
      isExpiringSoon: diffDays > 0 && diffDays <= 5,
      daysLeft: Math.max(0, diffDays),
      endDate: endDateStr,
    };
  }, [appData?.subscriptionEnd]);

  const subscriptionStatus = getSubscriptionStatus();

  const refreshProfile = useCallback(async () => {
    if (!isSignedIn) {
      setUser(null);
      setAppData(null);
      localStorage.removeItem('activeBusinessId');
      return;
    }
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setUser(null);
        setAppData(null);
        return;
      }
      const data = await res.json();
      const profile = data.user ?? {};
      const mapped = {
        ...profile,
        id: profile.id,
        name: profile.fullName,
        avatar: profile.imageUrl || '/assets/images/avatar/avatar-25.webp',
      } as User;
      setUser(mapped);

      const activeBusinessId =
        data.actor?.businessId ?? data.memberships?.[0]?.businessId ?? null;
      if (activeBusinessId) {
        localStorage.setItem('activeBusinessId', activeBusinessId);
      } else {
        localStorage.removeItem('activeBusinessId');
      }
      setAppData({
        businessId: activeBusinessId,
        role: data.actor?.role ?? null,
        memberships: data.memberships ?? [],
        subscriptionEnd: profile.subscriptionEnd ?? null,
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }, [isSignedIn, getToken]);

  // Load (or clear) the profile whenever Clerk auth state settles.
  useEffect(() => {
    if (!isLoaded) return;
    refreshProfile().finally(() => setProfileSettled(true));
  }, [isLoaded, isSignedIn, clerkUser?.id, refreshProfile]);

  const fetchCategories = useCallback(async () => {
    if (!appData?.businessId) return;
    try {
      setCategories(await api.getCategories(appData.businessId));
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, [appData?.businessId]);

  const fetchOutlets = useCallback(async () => {
    if (!appData?.businessId) return;
    try {
      const data = await api.getOutlets(appData.businessId);
      setOutlets(data.map((o: any) => ({ ...o, id: o.id ?? o._id })));
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
    }
  }, [appData?.businessId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  const logout = useCallback(async () => {
    localStorage.removeItem('activeBusinessId');
    setUser(null);
    setAppData(null);
    await signOut();
  }, [signOut]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const toggleTheme = useCallback(async () => {
    try {
      await api.toggleTheme();
    } catch {
      /* theme preference is non-critical */
    }
  }, []);

  // Legacy email/password/OTP flows are now handled by Clerk's UI.
  const login = useCallback(async (): Promise<User> => {
    throw new Error('Email/password login is handled by Clerk. Use the sign-in page.');
  }, []);
  const register = useCallback(async () => {
    throw new Error('Registration is handled by Clerk. Use the sign-up page.');
  }, []);
  const onboardEmployee = useCallback(async (data: any) => {
    await api.onboardEmployee(data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: null,
        isAuthenticated: !!isSignedIn && !!user,
        isInitialized: isLoaded && profileSettled,
        login,
        register,
        verifyOtp: NOOP_ASYNC,
        resendOtp: NOOP_ASYNC,
        forgotPassword: NOOP_ASYNC,
        resetPassword: NOOP_ASYNC,
        changePassword: NOOP_ASYNC,
        onboardEmployee,
        logout,
        updateUser,
        appData,
        categories,
        outlets,
        refreshCategories: fetchCategories,
        refreshOutlets: fetchOutlets,
        refreshProfile,
        toggleTheme,
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
