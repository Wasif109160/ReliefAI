'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    organization?: string;
    badgeNumber?: string;
    assignedZone?: string;
  }) => Promise<{ success: boolean; error?: string; verificationUrl?: string }>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const PRESET_CREDENTIALS: Record<string, { email: string; pass: string }> = {
  admin: { email: 'admin@relief.ai', pass: 'Admin@123456' },
  government: { email: 'gov@relief.ai', pass: 'Gov@123456' },
  ngo: { email: 'ngo@relief.ai', pass: 'Ngo@123456' },
  rescue_team: { email: 'rescue@relief.ai', pass: 'Rescue@123456' },
  volunteer: { email: 'rescue@relief.ai', pass: 'Rescue@123456' },
  responder: { email: 'rescue@relief.ai', pass: 'Rescue@123456' },
  commander: { email: 'admin@relief.ai', pass: 'Admin@123456' },
  citizen: { email: 'citizen@relief.ai', pass: 'Citizen@123456' },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'citizen',
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  switchRole: async () => {},
  refreshUser: async () => {},
  updateProfile: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch current user from /api/auth/me
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { credentials: 'include' },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch auth session:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Periodic token refresh every 10 minutes to maintain active session
  useEffect(() => {
    refreshUser();

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { credentials: 'include' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user);
        } else if (res.status === 401) {
          // Token expired or invalid
          setUser(null);
        }
      } catch (e) {
        console.warn('Background token refresh check:', e);
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [refreshUser]);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error connecting to auth service' };
    }
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    organization?: string;
    badgeNumber?: string;
    assignedZone?: string;
  }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      return { success: true, verificationUrl: data.verificationUrl };
    } catch {
      return { success: false, error: 'Network error connecting to registration service' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      router.push('/auth/login');
    }
  };

  // Switch role by logging into corresponding seeded test account
  const switchRole = async (newRole: UserRole) => {
    const creds = PRESET_CREDENTIALS[newRole];
    if (creds) {
      const res = await login(creds.email, creds.pass);
      if (res.success) {
        router.refresh();
      }
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Profile update failed' };
      }
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error updating profile' };
    }
  };

  const currentRole: UserRole = user?.role || 'citizen';
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
