import type { User } from 'src/types';

import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';

import { api } from 'src/services/api';

// ----------------------------------------------------------------------

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------------------------------------------------------

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken && storedUser) {
          setUser(JSON.parse(storedUser));
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
    const { user: userData, accessToken } = response;
    
    // Map API user to internal User type if needed
    const mappedUser: User = {
        ...userData,
        // Add compatibility fields
        id: userData._id,
        name: userData.fullName,
        avatar: '/assets/images/avatar/avatar-25.webp', // Default avatar
    };

    setUser(mappedUser);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(mappedUser));
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
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
        logout,
        updateUser,
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

