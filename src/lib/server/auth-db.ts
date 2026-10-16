import bcrypt from 'bcryptjs';
import {
  User,
  UserSession,
  RefreshTokenRecord,
  PasswordResetToken,
  EmailVerificationToken,
  NGOApplication,
  UserRole,
} from '../types';
import { connectToDatabase, isMongoConfigured } from '../mongodb';
import {
  UserModel,
  UserSessionModel,
  RefreshTokenModel,
  PasswordResetTokenModel,
  EmailVerificationTokenModel,
  NGOApplicationModel,
} from '../models';

// Pre-compute bcrypt hashes for seed users (in development & automated test environments)
const defaultHash = bcrypt.hashSync(process.env.SEED_ADMIN_PASSWORD || 'Admin@123456', 10);
const govHash = bcrypt.hashSync('Gov@123456', 10);
const ngoHash = bcrypt.hashSync('Ngo@123456', 10);
const rescueHash = bcrypt.hashSync('Rescue@123456', 10);
const citizenHash = bcrypt.hashSync('Citizen@123456', 10);

const initialNGOApplications: NGOApplication[] = [
  {
    id: 'ngo-app-101',
    organizationName: 'ব্র্যাক ডিজাস্টার ম্যানেজমেন্ট ক্লাস্টার (BRAC Disaster Cluster)',
    registrationNumber: 'NGOAB-DH-2024-0042',
    focalPersonName: 'মাহমুদুল হাসান (Mahmudul Hasan)',
    focalPersonEmail: 'brac.relief@humanitarian.org',
    focalPersonPhone: '+880 1711-223344',
    website: 'https://brac.net',
    hqAddress: 'BRAC Centre, 75 Mohakhali, Dhaka-1212',
    operationalDistricts: ['Sylhet', 'Sunamganj', 'Kurigram', 'Netrokona'],
    reliefCapabilities: ['Water Purification', 'Emergency Food Rations', 'Shelter Logistics'],
    documentName: 'BRAC_NGOAB_Renewal_Certificate_2025.pdf',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'ngo-app-102',
    organizationName: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি (BDRCS)',
    registrationNumber: 'BDRCS-EST-1973',
    focalPersonName: 'ফারহানা হক (Farhana Huq)',
    focalPersonEmail: 'ngo@relief.ai',
    focalPersonPhone: '+880 1912-003344',
    website: 'https://bdrcs.org',
    hqAddress: '684-686, Red Crescent Sarak, Bara Moghbazar, Dhaka-1217',
    operationalDistricts: ['All 64 Districts', 'Sylhet', 'Chittagong Coastal'],
    reliefCapabilities: ['Emergency Ambulance', 'Speedboat Extraction', 'Blood Bank', 'Relief Mesh'],
    documentName: 'BDRCS_Charter_Accreditation.pdf',
    status: 'approved',
    reviewedBy: 'Cmdr. Elena Vance',
    reviewedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

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
    assignedTeamId: 'team-01',
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
  ngoApplications: NGOApplication[];
}

const isProductionEnv = process.env.NODE_ENV === 'production';
const allowDemoAccounts = !isProductionEnv;

const authStore: AuthStore = {
  users: allowDemoAccounts ? [...initialUsers] : [],
  sessions: [],
  refreshTokens: [],
  passwordResetTokens: [],
  emailVerificationTokens: [],
  ngoApplications: [...initialNGOApplications],
};

let hasInitMongoAuth = false;
async function initAuthDb() {
  if (hasInitMongoAuth) return;
  if (isMongoConfigured()) {
    try {
      const conn = await connectToDatabase();
      if (conn) {
        hasInitMongoAuth = true;
        const count = await UserModel.countDocuments();
        if (count === 0) {
          if (allowDemoAccounts) {
            console.log('[AuthDB] Seeding initial test accounts into database (Development / Test Environment)...');
            await UserModel.insertMany(initialUsers);
          } else {
            console.warn('[ReliefAI Security] Production database has 0 users. Auto-seeding of default demo accounts is disabled.');
          }
        }
        const ngoCount = await NGOApplicationModel.countDocuments();
        if (ngoCount === 0) {
          await NGOApplicationModel.insertMany(initialNGOApplications);
        }
      }
    } catch (e) {
      console.warn('[ReliefAI Auth] Mongo connection fallback:', e);
    }
  }
}

export const authDb = {
  // Users
  async findUserByEmail(email: string): Promise<User | undefined> {
    await initAuthDb();
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoConfigured()) {
      try {
        const found = await UserModel.findOne({ email: cleanEmail }).lean();
        if (found) {
          const user = { ...found, id: (found as any).id, _id: undefined } as User;
          const idx = authStore.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
          if (idx !== -1) authStore.users[idx] = user;
          else authStore.users.push(user);
          return user;
        }
      } catch (err) {
        console.warn('Mongo findUserByEmail failed, using memory:', err);
      }
    }
    return authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
  },

  async findUserById(id: string): Promise<User | undefined> {
    await initAuthDb();
    if (isMongoConfigured()) {
      try {
        const found = await UserModel.findOne({ id }).lean();
        if (found) {
          return { ...found, id: (found as any).id, _id: undefined } as User;
        }
      } catch (err) {
        console.warn('Mongo findUserById failed:', err);
      }
    }
    return authStore.users.find((u) => u.id === id);
  },

  sanitizeUser(user: User): User {
    const { passwordHash: _hash, ...safe } = user;
    void _hash;
    return safe as User;
  },

  async createUser(data: {
    name: string;
    displayName?: string;
    email: string;
    password?: string;
    passwordHash?: string;
    role: UserRole;
    phone?: string;
    organization?: string;
    badgeNumber?: string;
    assignedTeamId?: string;
    assignedZone?: string;
    skills?: string[];
    isEmailVerified?: boolean;
  }): Promise<User> {
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
      assignedTeamId: data.assignedTeamId,
      assignedZone: data.assignedZone,
      skills: data.skills || [],
      createdAt: new Date().toISOString(),
    };

    authStore.users.push(newUser);

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await UserModel.create(newUser);
      } catch (err) {
        console.warn('Mongo createUser failed, saved in memory:', err);
      }
    }

    return newUser;
  },

  verifyPassword(user: User, candidate: string): boolean {
    if (!user.passwordHash) return false;
    return bcrypt.compareSync(candidate, user.passwordHash);
  },

  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    const user = authStore.users.find((u) => u.id === userId);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    const updatedAt = new Date().toISOString();

    if (user) {
      user.passwordHash = passwordHash;
      user.updatedAt = updatedAt;
    }

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await UserModel.findOneAndUpdate({ id: userId }, { passwordHash, updatedAt });
      } catch (err) {
        console.warn('Mongo updateUserPassword failed:', err);
      }
    }
    return Boolean(user);
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const user = authStore.users.find((u) => u.id === userId);
    const updatedAt = new Date().toISOString();
    if (user) {
      Object.assign(user, updates, { updatedAt });
    }

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const updated = await UserModel.findOneAndUpdate(
          { id: userId },
          { ...updates, updatedAt },
          { new: true }
        ).lean();
        if (updated) {
          return { ...updated, id: (updated as any).id, _id: undefined } as User;
        }
      } catch (err) {
        console.warn('Mongo updateUserProfile failed:', err);
      }
    }
    return user;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    return this.updateUserProfile(userId, updates);
  },

  async verifyUserEmail(userId: string): Promise<boolean> {
    const user = authStore.users.find((u) => u.id === userId);
    const updatedAt = new Date().toISOString();
    if (user) {
      user.isEmailVerified = true;
      user.updatedAt = updatedAt;
    }

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await UserModel.findOneAndUpdate({ id: userId }, { isEmailVerified: true, updatedAt });
      } catch (err) {
        console.warn('Mongo verifyUserEmail failed:', err);
      }
    }
    return Boolean(user);
  },

  async listUsers(): Promise<User[]> {
    await initAuthDb();
    if (isMongoConfigured()) {
      try {
        const users = await UserModel.find().lean();
        if (users && users.length > 0) {
          return users.map((u: any) => this.sanitizeUser({ ...u, id: u.id, _id: undefined }));
        }
      } catch (err) {
        console.warn('Mongo listUsers failed:', err);
      }
    }
    return authStore.users.map((u) => this.sanitizeUser(u));
  },

  getRawUsers(): User[] {
    return [...authStore.users];
  },

  async getAllUsers(): Promise<User[]> {
    return this.listUsers();
  },

  async deleteUser(userId: string): Promise<boolean> {
    const idx = authStore.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      authStore.users.splice(idx, 1);
    }
    await this.deleteUserSessions(userId);

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await UserModel.deleteOne({ id: userId });
      } catch (err) {
        console.warn('Mongo deleteUser failed:', err);
      }
    }
    return idx !== -1;
  },

  // Sessions
  async createSession(
    dataOrUserId: { userId: string; token?: string; ipAddress?: string; userAgent?: string; expiresAt?: string } | string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserSession> {
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

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await UserSessionModel.create(session);
      } catch (err) {
        console.warn('Mongo createSession failed:', err);
      }
    }
    return session;
  },

  async findSession(sessionId: string): Promise<UserSession | undefined> {
    if (isMongoConfigured()) {
      try {
        const found = await UserSessionModel.findOne({ id: sessionId }).lean();
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return { ...found, id: (found as any).id, _id: undefined } as UserSession;
        }
      } catch {}
    }
    return authStore.sessions.find(
      (s) => s.id === sessionId && new Date(s.expiresAt).getTime() > Date.now()
    );
  },

  async deleteSession(sessionId: string): Promise<void> {
    const idx = authStore.sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) authStore.sessions.splice(idx, 1);

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await UserSessionModel.deleteOne({ id: sessionId });
      } catch {}
    }
  },

  async deleteUserSessions(userId: string): Promise<void> {
    authStore.sessions = authStore.sessions.filter((s) => s.userId !== userId);
    authStore.refreshTokens = authStore.refreshTokens.filter((r) => r.userId !== userId);

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await UserSessionModel.deleteMany({ userId });
        await RefreshTokenModel.deleteMany({ userId });
      } catch {}
    }
  },

  // Refresh Token Rotation
  async storeRefreshToken(data: { userId: string; tokenHash: string; familyId: string; expiresAt: string }): Promise<RefreshTokenRecord> {
    const record: RefreshTokenRecord = {
      id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...data,
      isRevoked: false,
      createdAt: new Date().toISOString(),
    };
    authStore.refreshTokens.push(record);

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await RefreshTokenModel.create(record);
      } catch (err) {
        console.warn('Mongo storeRefreshToken failed:', err);
      }
    }
    return record;
  },

  async findRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | undefined> {
    if (isMongoConfigured()) {
      try {
        const found = await RefreshTokenModel.findOne({ tokenHash }).lean();
        if (found) {
          return { ...found, id: (found as any).id, _id: undefined } as RefreshTokenRecord;
        }
      } catch {}
    }
    return authStore.refreshTokens.find((r) => r.tokenHash === tokenHash);
  },

  async revokeTokenFamily(familyId: string): Promise<void> {
    authStore.refreshTokens.forEach((r) => {
      if (r.familyId === familyId) r.isRevoked = true;
    });

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await RefreshTokenModel.updateMany({ familyId }, { isRevoked: true });
      } catch {}
    }
  },

  // Password Reset Tokens
  async createPasswordResetToken(userId: string, token: string): Promise<PasswordResetToken> {
    authStore.passwordResetTokens = authStore.passwordResetTokens.filter((t) => t.userId !== userId);

    const record: PasswordResetToken = {
      id: `prt-${Date.now()}`,
      userId,
      token,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    authStore.passwordResetTokens.push(record);

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await PasswordResetTokenModel.deleteMany({ userId });
        await PasswordResetTokenModel.create(record);
      } catch {}
    }
    return record;
  },

  async findValidPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    if (isMongoConfigured()) {
      try {
        const found = await PasswordResetTokenModel.findOne({ token, usedAt: { $exists: false } }).lean();
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return { ...found, id: (found as any).id, _id: undefined } as PasswordResetToken;
        }
      } catch {}
    }
    return authStore.passwordResetTokens.find(
      (t) => t.token === token && !t.usedAt && new Date(t.expiresAt).getTime() > Date.now()
    );
  },

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    const item = authStore.passwordResetTokens.find((t) => t.token === token);
    const now = new Date().toISOString();
    if (item) item.usedAt = now;

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await PasswordResetTokenModel.updateOne({ token }, { usedAt: now });
      } catch {}
    }
  },

  // Email Verification Tokens
  async createEmailVerificationToken(userId: string, token: string): Promise<EmailVerificationToken> {
    const record: EmailVerificationToken = {
      id: `evt-${Date.now()}`,
      userId,
      token,
      otp: token.slice(0, 6),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    authStore.emailVerificationTokens.push(record);

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await EmailVerificationTokenModel.create(record);
      } catch {}
    }
    return record;
  },

  async findValidEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined> {
    if (isMongoConfigured()) {
      try {
        const found = await EmailVerificationTokenModel.findOne({ token, usedAt: { $exists: false } }).lean();
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return { ...found, id: (found as any).id, _id: undefined } as EmailVerificationToken;
        }
      } catch {}
    }
    return authStore.emailVerificationTokens.find(
      (t) => t.token === token && !t.usedAt && new Date(t.expiresAt).getTime() > Date.now()
    );
  },

  async markEmailVerificationTokenUsed(token: string): Promise<void> {
    const item = authStore.emailVerificationTokens.find((t) => t.token === token);
    const now = new Date().toISOString();
    if (item) item.usedAt = now;

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await EmailVerificationTokenModel.updateOne({ token }, { usedAt: now });
      } catch {}
    }
  },

  // --------------------------------------------------------------------------
  // 6-Digit Email Verification OTPs (Production Implementation)
  // --------------------------------------------------------------------------
  async createEmailVerificationOtp(
    userId: string,
    email: string,
    otp: string,
    type: EmailVerificationToken['type'] = 'email_verification',
    expiresMinutes: number = 10
  ): Promise<EmailVerificationToken> {
    const cleanEmail = email.toLowerCase().trim();
    // Invalidate existing unused OTPs for this email and type
    authStore.emailVerificationTokens = authStore.emailVerificationTokens.filter(
      (t) => !(t.email?.toLowerCase() === cleanEmail && t.type === type && !t.usedAt)
    );

    const record: EmailVerificationToken = {
      id: `otp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      email: cleanEmail,
      otp,
      type,
      attempts: 0,
      expiresAt: new Date(Date.now() + expiresMinutes * 60000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    authStore.emailVerificationTokens.push(record);

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await EmailVerificationTokenModel.deleteMany({ email: cleanEmail, type, usedAt: { $exists: false } });
        await EmailVerificationTokenModel.create(record);
      } catch (err) {
        console.warn('Mongo createEmailVerificationOtp fallback:', err);
      }
    }

    return record;
  },

  async findValidEmailVerificationOtp(
    email: string,
    otp: string,
    type?: string
  ): Promise<EmailVerificationToken | undefined> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    if (isMongoConfigured()) {
      try {
        const query: any = {
          email: cleanEmail,
          otp: cleanOtp,
          usedAt: { $exists: false },
        };
        if (type) query.type = type;
        const found = await EmailVerificationTokenModel.findOne(query).lean();
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return { ...found, id: (found as any).id, _id: undefined } as EmailVerificationToken;
        }
      } catch {}
    }

    return authStore.emailVerificationTokens.find(
      (t) =>
        t.email?.toLowerCase() === cleanEmail &&
        t.otp === cleanOtp &&
        (!type || t.type === type) &&
        !t.usedAt &&
        new Date(t.expiresAt).getTime() > Date.now()
    );
  },

  async markEmailVerificationOtpUsed(id: string): Promise<void> {
    const item = authStore.emailVerificationTokens.find((t) => t.id === id);
    const now = new Date().toISOString();
    if (item) item.usedAt = now;

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await EmailVerificationTokenModel.updateOne({ id }, { usedAt: now });
      } catch {}
    }
  },

  // --------------------------------------------------------------------------
  // 6-Digit Password Reset OTPs
  // --------------------------------------------------------------------------
  async createPasswordResetOtp(
    userId: string,
    email: string,
    otp: string,
    expiresMinutes: number = 10
  ): Promise<PasswordResetToken> {
    const cleanEmail = email.toLowerCase().trim();
    authStore.passwordResetTokens = authStore.passwordResetTokens.filter(
      (t) => !(t.email?.toLowerCase() === cleanEmail && !t.usedAt)
    );

    const record: PasswordResetToken = {
      id: `protp-${Date.now()}`,
      userId,
      email: cleanEmail,
      token: otp,
      otp,
      attempts: 0,
      expiresAt: new Date(Date.now() + expiresMinutes * 60000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    authStore.passwordResetTokens.push(record);

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await PasswordResetTokenModel.deleteMany({ email: cleanEmail, usedAt: { $exists: false } });
        await PasswordResetTokenModel.create(record);
      } catch {}
    }

    return record;
  },

  async findValidPasswordResetOtp(email: string, otp: string): Promise<PasswordResetToken | undefined> {
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    if (isMongoConfigured()) {
      try {
        const found = await PasswordResetTokenModel.findOne({
          email: cleanEmail,
          $or: [{ otp: cleanOtp }, { token: cleanOtp }],
          usedAt: { $exists: false },
        }).lean();
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return { ...found, id: (found as any).id, _id: undefined } as PasswordResetToken;
        }
      } catch {}
    }

    return authStore.passwordResetTokens.find(
      (t) =>
        t.email?.toLowerCase() === cleanEmail &&
        (t.otp === cleanOtp || t.token === cleanOtp) &&
        !t.usedAt &&
        new Date(t.expiresAt).getTime() > Date.now()
    );
  },

  async markPasswordResetOtpUsed(id: string): Promise<void> {
    const item = authStore.passwordResetTokens.find((t) => t.id === id);
    const now = new Date().toISOString();
    if (item) item.usedAt = now;

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await PasswordResetTokenModel.updateOne({ id }, { usedAt: now });
      } catch {}
    }
  },

  // --------------------------------------------------------------------------
  // NGO Accreditation Applications
  // --------------------------------------------------------------------------
  async createNGOApplication(data: Omit<NGOApplication, 'id' | 'status' | 'createdAt'>): Promise<NGOApplication> {
    await initAuthDb();
    const newApp: NGOApplication = {
      id: `ngo-app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      focalPersonEmail: data.focalPersonEmail.toLowerCase().trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    authStore.ngoApplications.unshift(newApp);

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await NGOApplicationModel.create(newApp);
      } catch (err) {
        console.warn('Mongo createNGOApplication fallback:', err);
      }
    }

    return newApp;
  },

  async listNGOApplications(status?: 'pending' | 'approved' | 'rejected'): Promise<NGOApplication[]> {
    await initAuthDb();
    if (isMongoConfigured()) {
      try {
        const query = status ? { status } : {};
        const list = await NGOApplicationModel.find(query).sort({ createdAt: -1 }).lean();
        if (list && list.length > 0) {
          return list.map((a: any) => ({ ...a, id: a.id, _id: undefined }));
        }
      } catch {}
    }
    return status ? authStore.ngoApplications.filter((a) => a.status === status) : [...authStore.ngoApplications];
  },

  async findNGOApplicationById(id: string): Promise<NGOApplication | undefined> {
    await initAuthDb();
    if (isMongoConfigured()) {
      try {
        const found = await NGOApplicationModel.findOne({ id }).lean();
        if (found) return { ...found, id: (found as any).id, _id: undefined } as NGOApplication;
      } catch {}
    }
    return authStore.ngoApplications.find((a) => a.id === id);
  },

  async updateNGOApplication(id: string, updates: Partial<NGOApplication>): Promise<NGOApplication | undefined> {
    await initAuthDb();
    const app = authStore.ngoApplications.find((a) => a.id === id);
    const now = new Date().toISOString();
    if (app) {
      Object.assign(app, updates, { updatedAt: now });
    }

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const updated = await NGOApplicationModel.findOneAndUpdate(
          { id },
          { ...updates, updatedAt: now },
          { new: true }
        ).lean();
        if (updated) return { ...updated, id: (updated as any).id, _id: undefined } as NGOApplication;
      } catch {}
    }

    return app;
  },

  // --------------------------------------------------------------------------
  // Provisioning Official Personnel (Rescue Team, Government, NGO)
  // --------------------------------------------------------------------------
  async provisionOfficialUser(data: {
    name: string;
    displayName?: string;
    email: string;
    role: UserRole;
    organization?: string;
    badgeNumber?: string;
    assignedZone?: string;
    phone?: string;
    password: string;
    isEmailVerified?: boolean;
  }): Promise<User> {
    return this.createUser({
      name: data.name,
      displayName: data.displayName || data.name,
      email: data.email,
      role: data.role,
      organization: data.organization,
      badgeNumber: data.badgeNumber,
      assignedZone: data.assignedZone,
      phone: data.phone,
      password: data.password,
      isEmailVerified: data.isEmailVerified ?? false,
    });
  },
};
