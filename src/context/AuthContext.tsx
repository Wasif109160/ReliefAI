'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';

const PRESET_USERS: Record<UserRole, UserProfile> = {
  citizen: {
    uid: 'demo-citizen-1',
    name: 'Marcus Vance',
    displayName: 'Marcus Vance',
    email: 'marcus.vance@civilian.net',
    role: 'citizen',
    phoneNumber: '+1 (555) 234-8901',
    assignedZone: 'Fluvial District Sector 4',
    createdAt: new Date().toISOString(),
  },
  volunteer: {
    uid: 'demo-volunteer-2',
    name: 'Chloe Dubois',
    displayName: 'Chloe Dubois',
    email: 'chloe.dubois@volunteer.relief.ai',
    role: 'volunteer',
    phoneNumber: '+1 (555) 441-2099',
    organization: 'Community First Aid Alliance',
    skills: ['Swift Water Pilot', 'CPR Certified', 'Bilingual Translator'],
    assignedZone: 'Cascadia Sector 4',
    createdAt: new Date().toISOString(),
  },
  ngo: {
    uid: 'demo-ngo-3',
    name: 'Sarah Chen (Red Cross)',
    displayName: 'Sarah Chen (Red Cross)',
    email: 'sarah.chen@redcross-alliance.org',
    role: 'ngo',
    phoneNumber: '+1 (555) 781-3300',
    organization: 'International Relief & Red Cross Alliance',
    assignedZone: 'Regional Warehouse Alpha & Shelters',
    createdAt: new Date().toISOString(),
  },
  admin: {
    uid: 'demo-admin-4',
    name: 'Cmdr. Elena Vance',
    displayName: 'Cmdr. Elena Vance',
    email: 'elena.vance@relief.ai',
    role: 'admin',
    badgeNumber: 'IC-9021',
    organization: 'Cascadia Joint Emergency Management Agency (CJEMA)',
    phoneNumber: '+1 (555) 019-2831',
    assignedZone: 'Cascadia Emergency Ops Center (EOC)',
    createdAt: new Date().toISOString(),
  },
  commander: {
    uid: 'demo-admin-4',
    name: 'Cmdr. Elena Vance',
    displayName: 'Cmdr. Elena Vance',
    email: 'elena.vance@relief.ai',
    role: 'commander',
    badgeNumber: 'IC-9021',
    organization: 'Cascadia Joint Emergency Management Agency (CJEMA)',
    phoneNumber: '+1 (555) 019-2831',
    assignedZone: 'Cascadia Emergency Ops Center (EOC)',
    createdAt: new Date().toISOString(),
  },
  responder: {
    uid: 'demo-responder-5',
    name: 'Lt. James Morales',
    displayName: 'Lt. James Morales',
    email: 'j.morales@relief.ai',
    role: 'responder',
    badgeNumber: 'EMT-P-4402',
    organization: 'Metro Urban Search & Rescue Task Force 1',
    phoneNumber: '+1 (555) 782-9901',
    assignedZone: 'Mobile Command Unit 4',
    createdAt: new Date().toISOString(),
  },
};

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  switchRole: (newRole: UserRole) => void;
  logout: () => Promise<void>;
  isFirebaseLive: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: PRESET_USERS.citizen,
  role: 'citizen',
  switchRole: () => {},
  logout: async () => {},
  isFirebaseLive: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('citizen');
  const [user, setUser] = useState<UserProfile>(PRESET_USERS.citizen);

  useEffect(() => {
    const saved = localStorage.getItem('reliefai_role') as UserRole | null;
    if (saved && PRESET_USERS[saved]) {
      setRole(saved);
      setUser(PRESET_USERS[saved]);
    }

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser((prev) => ({
            ...prev,
            uid: fbUser.uid,
            email: fbUser.email || prev.email,
            displayName: fbUser.displayName || prev.displayName || prev.name,
            name: fbUser.displayName || prev.name,
          }));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    setUser(PRESET_USERS[newRole]);
    localStorage.setItem('reliefai_role', newRole);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    switchRole('citizen');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        switchRole,
        logout,
        isFirebaseLive: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
