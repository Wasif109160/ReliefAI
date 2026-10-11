import { User, UserRole } from './types';

export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: 'usr-admin-01',
    name: 'Cmdr. Elena Vance',
    displayName: 'Cmdr. Elena Vance',
    email: 'elena.vance@relief.ai',
    role: 'admin',
    badgeNumber: 'IC-9021',
    organization: 'Cascadia Joint Emergency Management Agency (CJEMA)',
    phone: '+1 (555) 019-2831',
    skills: ['Incident Command System (ICS-400)', 'Disaster Resource Allocation', 'Airspace Coordination'],
    location: {
      name: 'Cascadia Emergency Ops Center (EOC)',
      lat: 45.5231,
      lng: -122.6765,
    },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  commander: {
    id: 'usr-commander-01',
    name: 'Cmdr. Elena Vance',
    displayName: 'Cmdr. Elena Vance',
    email: 'elena.vance@relief.ai',
    role: 'commander',
    badgeNumber: 'IC-9021',
    organization: 'Cascadia Joint Emergency Management Agency (CJEMA)',
    phone: '+1 (555) 019-2831',
    skills: ['Incident Command System (ICS-400)', 'Disaster Resource Allocation'],
    location: {
      name: 'Cascadia Emergency Ops Center (EOC)',
      lat: 45.5231,
      lng: -122.6765,
    },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  responder: {
    id: 'usr-responder-02',
    name: 'Lt. James Morales',
    displayName: 'Lt. James Morales',
    role: 'responder',
    email: 'j.morales@relief.ai',
    badgeNumber: 'EMT-P-4402',
    organization: 'Metro Urban Search & Rescue Task Force 1',
    phone: '+1 (555) 782-9901',
    skills: ['Paramedic Trauma Care', 'Swift Water Rescue Tech II'],
    location: {
      name: 'Mobile Command Unit 4',
      lat: 45.4850,
      lng: -122.6280,
    },
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  volunteer: {
    id: 'usr-volunteer-03',
    name: 'Chloe Dubois',
    displayName: 'Chloe Dubois',
    role: 'volunteer',
    email: 'chloe.dubois@humanitarian.org',
    organization: 'Red Cross Logistics & Shelter Alliance',
    phone: '+1 (555) 441-2099',
    skills: ['Shelter Intake Logistics', 'Bilingual (English/Spanish)', 'First Aid / CPR Certified'],
    location: {
      name: 'Cascadia Civic Arena Shelter',
      lat: 45.5300,
      lng: -122.6650,
    },
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  ngo: {
    id: 'usr-ngo-04',
    name: 'Sarah Chen (Red Cross)',
    displayName: 'Sarah Chen (Red Cross)',
    role: 'ngo',
    email: 'sarah.chen@redcross-alliance.org',
    organization: 'International Relief & Red Cross Alliance',
    phone: '+1 (555) 781-3300',
    skills: ['Logistics Fleet Coordination', 'Relief Supply Allocation'],
    location: {
      name: 'Regional Depot Alpha',
      lat: 45.5450,
      lng: -122.6000,
    },
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  citizen: {
    id: 'usr-citizen-05',
    name: 'Marcus Vance',
    displayName: 'Marcus Vance',
    role: 'citizen',
    email: 'marcus.vance@email.net',
    phone: '+1 (555) 234-8901',
    location: {
      name: 'Fluvial District Sector 4',
      lat: 45.5180,
      lng: -122.6720,
    },
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
};

export const AUTH_COOKIE_NAME = 'reliefai_user_role';

export function getDefaultUser(): User {
  return DEMO_USERS.admin;
}

export function getUserForRole(role: UserRole): User {
  return DEMO_USERS[role] || DEMO_USERS.admin;
}
