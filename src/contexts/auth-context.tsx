import type { User, Outlet, Category } from 'src/types';

import { useState, useEffect, useContext, useCallback, createContext, type ReactNode } from 'react';

import { api } from 'src/services/api';

// ----------------------------------------------------------------------

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
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

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  // const [workspaces, setWorkspaces] = useState<WorkspacesPopoverProps['data']>([]);

  const [appData, setAppData] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const [isInitialized, setIsInitialized] = useState(false);

  const getSubscriptionStatus = useCallback(() => {
    const endDateStr = appData?.subscriptionEnd;
    if (!endDateStr) {
      return { isExpired: false, isExpiringSoon: false, daysLeft: 0, endDate: null };
    }

    const endDate = new Date(endDateStr);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      isExpired: diffTime <= 0,
      isExpiringSoon: diffDays > 0 && diffDays <= 5,
      daysLeft: Math.max(0, diffDays),
      endDate: endDateStr,
    };
  }, [appData?.subscriptionEnd]);

  const subscriptionStatus = getSubscriptionStatus();

  const fetchCategories = useCallback(async () => {
    if (appData?.businessId) {
      try {
        const data = await api.getCategories(appData.businessId);
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
  }, [appData?.businessId]);

  const fetchOutlets = useCallback(async () => {
    if (appData?.businessId) {
      try {
        const data = await api.getOutlets(appData.businessId);
        setOutlets(data);
      } catch (error) {
        console.error('Failed to fetch outlets:', error);
      }
    }
  }, [appData?.businessId]);

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
      setAppData(profileAppData);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      localStorage.setItem('appData', JSON.stringify(profileAppData));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [user?.avatar]);

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
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken && storedUser) {
          setUser(JSON.parse(storedUser));
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
    const { user: userData, accessToken, appData: loginAppData } = response;

    // Map API user to internal User type if needed
    const mappedUser: User = {
      ...userData,
      // Add compatibility fields
      id: userData._id,
      name: userData.fullName,
      avatar: '/assets/images/avatar/avatar-25.webp', // Default avatar
    };

    setUser(mappedUser);
    setAppData(loginAppData);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(mappedUser));
    localStorage.setItem('appData', JSON.stringify(loginAppData));
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

  const logout = () => {
    setUser(null);
    setAppData(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('appData');
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitialized,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        updateUser,
        appData,
        categories,
        outlets,
        refreshCategories,
        refreshOutlets,
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
