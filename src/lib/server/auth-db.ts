import bcrypt from 'bcryptjs';
import {
  User,
  UserSession,
  RefreshTokenRecord,
  PasswordResetToken,
  EmailVerificationToken,
  UserRole,
} from '../types';

// Pre-compute bcrypt hashes for seed users (cost factor 10)
const defaultHash = bcrypt.hashSync('Admin@123456', 10);
const govHash = bcrypt.hashSync('Gov@123456', 10);
const ngoHash = bcrypt.hashSync('Ngo@123456', 10);
const rescueHash = bcrypt.hashSync('Rescue@123456', 10);
const citizenHash = bcrypt.hashSync('Citizen@123456', 10);

const initialUsers: User[] = [
  {
    id: 'usr-admin-01',
    name: 'Cmdr. Elena Vance',
    displayName: 'Cmdr. Elena Vance',
    email: 'admin@relief.ai',
    passwordHash: defaultHash,
    role: 'admin',
    isEmailVerified: true,
    badgeNumber: 'ICS-9001',
    organization: 'National Disaster Management Agency (NDMA)',
    phone: '+1 (555) 019-2831',
    skills: ['ICS-400 Incident Commander', 'Strategic Operations', 'Crisis Coordination'],
    assignedZone: 'National EOC Bunker',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-gov-02',
    name: 'Secretary Tariq Rahman',
    displayName: 'Sec. Tariq Rahman',
    email: 'gov@relief.ai',
    passwordHash: govHash,
    role: 'government',
    isEmailVerified: true,
    organization: 'Ministry of Disaster Management & Relief',
    phone: '+1 (555) 880-9921',
    assignedZone: 'Federal Operations Center',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-ngo-03',
    name: 'Sarah Chen',
    displayName: 'Sarah Chen (Red Cross)',
    email: 'ngo@relief.ai',
    passwordHash: ngoHash,
    role: 'ngo',
    isEmailVerified: true,
    organization: 'International Red Cross & Crescent Alliance',
    phone: '+1 (555) 781-3300',
    skills: ['Logistics Fleet Coordination', 'Relief Supply Warehouse Lead'],
    assignedZone: 'Regional Logistics Depot Alpha',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-rescue-04',
    name: 'Capt. James Morales',
    displayName: 'Capt. James Morales',
    email: 'rescue@relief.ai',
    passwordHash: rescueHash,
    role: 'rescue_team',
    isEmailVerified: true,
    badgeNumber: 'USAR-TF1-LEAD',
    organization: 'Metro Urban Search & Rescue Task Force 1',
    phone: '+1 (555) 782-9901',
    skills: ['Swift Water Rescue Tech II', 'Heavy Hydraulic Extrication', 'Trauma Paramedic'],
    assignedZone: 'Sector 4 Fluvial District',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-citizen-05',
    name: 'Marcus Vance',
    displayName: 'Marcus Vance',
    email: 'citizen@relief.ai',
    passwordHash: citizenHash,
    role: 'citizen',
    isEmailVerified: true,
    phone: '+1 (555) 234-8901',
    location: {
      name: 'Fluvial District Sector 4',
      lat: 45.518,
      lng: -122.672,
    },
    assignedZone: 'Fluvial District',
    createdAt: new Date().toISOString(),
  },
];

interface AuthStore {
  users: User[];
  sessions: UserSession[];
  refreshTokens: RefreshTokenRecord[];
  passwordResetTokens: PasswordResetToken[];
  emailVerificationTokens: EmailVerificationToken[];
}

const authStore: AuthStore = {
  users: [...initialUsers],
  sessions: [],
  refreshTokens: [],
  passwordResetTokens: [],
  emailVerificationTokens: [],
};

export const authDb = {
  // Users
  findUserByEmail(email: string): User | undefined {
    return authStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  },

  findUserById(id: string): User | undefined {
    return authStore.users.find((u) => u.id === id);
  },

  sanitizeUser(user: User): User {
    const { passwordHash, ...safe } = user;
    return safe as User;
  },

  createUser(data: {
    name: string;
    displayName?: string;
    email: string;
    password?: string;
    passwordHash?: string;
    role: UserRole;
    phone?: string;
    organization?: string;
    badgeNumber?: string;
    assignedZone?: string;
    skills?: string[];
    isEmailVerified?: boolean;
  }): User {
    const passwordHash = data.passwordHash || (data.password ? bcrypt.hashSync(data.password, 10) : '');

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      displayName: data.displayName || data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: data.role,
      isEmailVerified: data.isEmailVerified || false,
      phone: data.phone,
      phoneNumber: data.phone,
      organization: data.organization,
      badgeNumber: data.badgeNumber,
      assignedZone: data.assignedZone,
      skills: data.skills || [],
      createdAt: new Date().toISOString(),
    };

    authStore.users.push(newUser);
    return newUser;
  },

  verifyPassword(user: User, candidate: string): boolean {
    if (!user.passwordHash) return false;
    return bcrypt.compareSync(candidate, user.passwordHash);
  },

  updateUserPassword(userId: string, newPassword: string): boolean {
    const user = authStore.users.find((u) => u.id === userId);
    if (!user) return false;
    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPassword, salt);
    user.updatedAt = new Date().toISOString();
    return true;
  },

  updateUserProfile(userId: string, updates: Partial<User>): User | undefined {
    const user = authStore.users.find((u) => u.id === userId);
    if (!user) return undefined;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    return user;
  },

  updateUser(userId: string, updates: Partial<User>): User | undefined {
    return this.updateUserProfile(userId, updates);
  },

  verifyUserEmail(userId: string): boolean {
    const user = authStore.users.find((u) => u.id === userId);
    if (!user) return false;
    user.isEmailVerified = true;
    user.updatedAt = new Date().toISOString();
    return true;
  },

  listUsers(): User[] {
    return authStore.users.map((u) => this.sanitizeUser(u));
  },

  getAllUsers(): User[] {
    return this.listUsers();
  },

  deleteUser(userId: string): boolean {
    const idx = authStore.users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    authStore.users.splice(idx, 1);
    this.deleteUserSessions(userId);
    return true;
  },

  // Sessions
  createSession(
    dataOrUserId: { userId: string; token?: string; ipAddress?: string; userAgent?: string; expiresAt?: string } | string,
    ipAddress?: string,
    userAgent?: string
  ): UserSession {
    let sessionData: { userId: string; token: string; ipAddress?: string; userAgent?: string; expiresAt: string };
    if (typeof dataOrUserId === 'string') {
      sessionData = {
        userId: dataOrUserId,
        token: `tok-${Date.now()}`,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Browser',
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      };
    } else {
      sessionData = {
        userId: dataOrUserId.userId,
        token: dataOrUserId.token || `tok-${Date.now()}`,
        ipAddress: dataOrUserId.ipAddress,
        userAgent: dataOrUserId.userAgent,
        expiresAt: dataOrUserId.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
      };
    }

    const session: UserSession = {
      id: `sid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...sessionData,
      createdAt: new Date().toISOString(),
    };
    authStore.sessions.push(session);
    return session;
  },

  findSession(sessionId: string): UserSession | undefined {
    return authStore.sessions.find(
      (s) => s.id === sessionId && new Date(s.expiresAt).getTime() > Date.now()
    );
  },

  deleteSession(sessionId: string): void {
    const idx = authStore.sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) authStore.sessions.splice(idx, 1);
  },

  deleteUserSessions(userId: string): void {
    authStore.sessions = authStore.sessions.filter((s) => s.userId !== userId);
    // Also revoke refresh tokens
    authStore.refreshTokens = authStore.refreshTokens.filter((r) => r.userId !== userId);
  },

  // Refresh Token Rotation
  storeRefreshToken(data: { userId: string; tokenHash: string; familyId: string; expiresAt: string }): RefreshTokenRecord {
    const record: RefreshTokenRecord = {
      id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...data,
      isRevoked: false,
      createdAt: new Date().toISOString(),
    };
    authStore.refreshTokens.push(record);
    return record;
  },

  findRefreshToken(tokenHash: string): RefreshTokenRecord | undefined {
    return authStore.refreshTokens.find((r) => r.tokenHash === tokenHash);
  },

  revokeTokenFamily(familyId: string): void {
    authStore.refreshTokens.forEach((r) => {
      if (r.familyId === familyId) r.isRevoked = true;
    });
  },

  // Password Reset Tokens
  createPasswordResetToken(userId: string, token: string): PasswordResetToken {
    // Invalidate existing unused tokens for user
    authStore.passwordResetTokens = authStore.passwordResetTokens.filter((t) => t.userId !== userId);

    const record: PasswordResetToken = {
      id: `prt-${Date.now()}`,
      userId,
      token,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      createdAt: new Date().toISOString(),
    };
    authStore.passwordResetTokens.push(record);
    return record;
  },

  findValidPasswordResetToken(token: string): PasswordResetToken | undefined {
    return authStore.passwordResetTokens.find(
      (t) => t.token === token && !t.usedAt && new Date(t.expiresAt).getTime() > Date.now()
    );
  },

  markPasswordResetTokenUsed(token: string): void {
    const item = authStore.passwordResetTokens.find((t) => t.token === token);
    if (item) item.usedAt = new Date().toISOString();
  },

  // Email Verification Tokens
  createEmailVerificationToken(userId: string, token: string): EmailVerificationToken {
    const record: EmailVerificationToken = {
      id: `evt-${Date.now()}`,
      userId,
      token,
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours
      createdAt: new Date().toISOString(),
    };
    authStore.emailVerificationTokens.push(record);
    return record;
  },

  findValidEmailVerificationToken(token: string): EmailVerificationToken | undefined {
    return authStore.emailVerificationTokens.find(
      (t) => t.token === token && !t.usedAt && new Date(t.expiresAt).getTime() > Date.now()
    );
  },

  markEmailVerificationTokenUsed(token: string): void {
    const item = authStore.emailVerificationTokens.find((t) => t.token === token);
    if (item) item.usedAt = new Date().toISOString();
  },
};
