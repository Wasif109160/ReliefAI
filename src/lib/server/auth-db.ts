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
    name: 'ব্রিগেডিয়ার জেনারেল মোস্তাফিজুর রহমান (Brig. Gen. Mostafizur Rahman)',
    displayName: 'Brig. Gen. Mostafizur Rahman',
    email: 'admin@relief.ai',
    passwordHash: defaultHash,
    role: 'admin',
    isEmailVerified: true,
    badgeNumber: 'BD-AFD-9001',
    organization: 'দুর্যোগ ব্যবস্থাপনা অধিদপ্তর ও সশস্ত্র বাহিনী বিভাগ (DDM / AFD)',
    phone: '+880 1711-001122',
    skills: ['জাতীয় ক্রাইসিস সমন্বয়', 'সশস্ত্র বাহিনী লজিস্টিকস', 'ইন্সিডেন্ট কমান্ড ICS-400'],
    assignedZone: 'জাতীয় ইমার্জেন্সি অপারেশন সেন্টার (National EOC Dhaka)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-gov-02',
    name: 'সচিব ড. তারেক মাহমুদ (Sec. Dr. Tareq Mahmud)',
    displayName: 'Sec. Dr. Tareq Mahmud',
    email: 'gov@relief.ai',
    passwordHash: govHash,
    role: 'government',
    isEmailVerified: true,
    organization: 'দুর্যোগ ব্যবস্থাপনা ও ত্রাণ মন্ত্রণালয় (MoDMR Bangladesh)',
    phone: '+880 1819-002233',
    assignedZone: 'বাংলাদেশ সচিবালয়, ঢাকা',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-ngo-03',
    name: 'ফারহানা হক (Farhana Huq)',
    displayName: 'Farhana Huq (BRAC & BDRCS)',
    email: 'ngo@relief.ai',
    passwordHash: ngoHash,
    role: 'ngo',
    isEmailVerified: true,
    organization: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি ও ব্র্যাক (BDRCS / BRAC)',
    phone: '+880 1912-003344',
    skills: ['ত্রাণ বিতরণ ও লজিস্টিকস সমন্বয়', 'জরুরি পানি ও খাদ্য সরবরাহ'],
    assignedZone: 'সিলেট-সুনামগঞ্জ আঞ্চলিক ত্রাণ ডিপো',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-rescue-04',
    name: 'ক্যাপ্টেন তানভীর আহমেদ (Capt. Tanvir Ahmed)',
    displayName: 'Capt. Tanvir Ahmed (FSCD)',
    email: 'rescue@relief.ai',
    passwordHash: rescueHash,
    role: 'rescue_team',
    isEmailVerified: true,
    badgeNumber: 'FSCD-USAR-DIV1',
    organization: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স (FSCD Sylhet Division)',
    phone: '+880 1611-004455',
    skills: ['স্পিডবোট উদ্ধার অভিযান', 'ডুবুরি সার্টিফাইড রেসকিউয়ার', 'জরুরি ট্রমা ও প্যারামেডিক'],
    assignedZone: 'সুরমা-কুশিয়ারা রিভারাইন সেক্টর ১',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-citizen-05',
    name: 'রফিকুল ইসলাম (Rafiqul Islam)',
    displayName: 'Rafiqul Islam',
    email: 'citizen@relief.ai',
    passwordHash: citizenHash,
    role: 'citizen',
    isEmailVerified: true,
    phone: '+880 1712-345678',
    location: {
      name: 'গোয়াইনঘাট উপজেলা, সিলেট (Gowainghat, Sylhet)',
      lat: 25.0760,
      lng: 91.9750,
    },
    assignedZone: 'গোয়াইনঘাট বন্যা প্লাবন এলাকা',
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

  getRawUsers(): User[] {
    return [...authStore.users];
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
