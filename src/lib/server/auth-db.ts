import mongoose from 'mongoose';
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
import {
  connectToDatabase,
  isMongoConfigured,
  DatabaseUnavailableError,
  isDatabaseUnavailableError,
} from '../mongodb';
import {
  UserModel,
  UserSessionModel,
  RefreshTokenModel,
  PasswordResetTokenModel,
  EmailVerificationTokenModel,
  NGOApplicationModel,
} from '../models';

// Pre-compute bcrypt hashes for seed users (in development & automated test environments)
const superAdminHash = bcrypt.hashSync('SuperAdmin@123456', 10);
const defaultHash = bcrypt.hashSync(process.env.SEED_ADMIN_PASSWORD || 'Admin@123456', 10);
const govHash = bcrypt.hashSync('Gov@123456', 10);
const ngoHash = bcrypt.hashSync('Ngo@123456', 10);
const rescueHash = bcrypt.hashSync('Rescue@123456', 10);
const volunteerHash = bcrypt.hashSync('Volunteer@123456', 10);
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
    id: 'usr-superadmin-00',
    name: 'মেজর জেনারেল কে. এম. সাজ্জাদুল ইসলাম (Maj. Gen. Sajjadul Islam)',
    displayName: 'Maj. Gen. Sajjadul Islam (Super Admin)',
    email: 'superadmin@relief.ai',
    passwordHash: superAdminHash,
    role: 'super_admin',
    isEmailVerified: true,
    status: 'approved',
    badgeNumber: 'BD-SADM-0001',
    organization: 'জাতীয় দুর্যোগ ব্যবস্থাপনা কমান্ড ও সমন্বয় কর্তৃপক্ষ (NDMCA & Armed Forces)',
    phone: '+880 1711-998877',
    skills: ['কৌশলগত জাতীয় ক্রাইসিস কমান্ড', 'সশস্ত্র বাহিনী যৌথ লজিস্টিকস', 'জরুরি স্যাটেলাইট মেশ সমন্বয়'],
    assignedZone: 'জাতীয় কৌশলগত কমান্ড সেন্টার (National Strategic Command Dhaka)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-admin-01',
    name: 'ব্রিগেডিয়ার জেনারেল মোস্তাফিজুর রহমান (Brig. Gen. Mostafizur Rahman)',
    displayName: 'Brig. Gen. Mostafizur Rahman',
    email: 'admin@relief.ai',
    passwordHash: defaultHash,
    role: 'admin',
    isEmailVerified: true,
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
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
    status: 'approved',
    badgeNumber: 'FSCD-USAR-DIV1',
    assignedTeamId: 'team-01',
    organization: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স (FSCD Sylhet Division)',
    phone: '+880 1611-004455',
    skills: ['স্পিডবোট উদ্ধার অভিযান', 'ডুবুরি সার্টিফাইড রেসকিউয়ার', 'জরুরি ট্রমা ও প্যারামেডিক'],
    assignedZone: 'সুরমা-কুশিয়ারা রিভারাইন সেক্টর ১',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-volunteer-06',
    name: 'তাহমিনা আক্তার (Tahmina Akter)',
    displayName: 'Tahmina Akter (Volunteer Lead)',
    email: 'volunteer@relief.ai',
    passwordHash: volunteerHash,
    role: 'volunteer',
    isEmailVerified: true,
    status: 'approved',
    badgeNumber: 'BD-VOL-7701',
    organization: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি যুব স্বেচ্ছাসেবক দল (BDRCS Youth Volunteers)',
    phone: '+880 1715-443322',
    skills: ['Shelter Intake Logistics', 'Bilingual Field Support', 'First Aid / CPR Certified', 'Community Relief Mesh'],
    assignedZone: 'সিলেট সদর আশ্রয়কেন্দ্র ও ফিল্ড সমন্বয় হাব',
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
    status: 'approved',
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
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !isMongoConfigured()) {
    throw new DatabaseUnavailableError('FATAL: MONGODB_URI is required and cannot be empty in production.');
  }

  if (hasInitMongoAuth && mongoose.connection.readyState === 1) return;
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
      if (isProduction) {
        throw isDatabaseUnavailableError(e)
          ? e
          : new DatabaseUnavailableError('Failed to establish database connection in production.');
      }
      console.warn('[ReliefAI Auth] Mongo connection fallback:', e);
    }
  }
}

export const authDb = {
  // Users
  async findUserByEmail(email: string): Promise<User | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
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
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed during user lookup.');
        }
        console.warn('Mongo findUserByEmail failed, using memory:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
  },

  async findUserById(id: string): Promise<User | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    if (isMongoConfigured()) {
      try {
        const found = await UserModel.findOne({ id }).lean();
        if (found) {
          return { ...found, id: (found as any).id, _id: undefined } as User;
        }
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed during user lookup.');
        }
        console.warn('Mongo findUserById failed:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
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

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await UserModel.create(newUser);
        return newUser;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating user.');
      }
    }

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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);
    const updatedAt = new Date().toISOString();

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        const res = await UserModel.findOneAndUpdate({ id: userId }, { passwordHash, updatedAt });
        return Boolean(res);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating password.');
      }
    }

    const user = authStore.users.find((u) => u.id === userId);
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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const updatedAt = new Date().toISOString();

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
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
        return undefined;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating user profile.');
      }
    }

    const user = authStore.users.find((u) => u.id === userId);
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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const updatedAt = new Date().toISOString();

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        const res = await UserModel.findOneAndUpdate({ id: userId }, { isEmailVerified: true, updatedAt });
        return Boolean(res);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while verifying user email.');
      }
    }

    const user = authStore.users.find((u) => u.id === userId);
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
    const isProduction = process.env.NODE_ENV === 'production';
    if (isMongoConfigured()) {
      try {
        const users = await UserModel.find().lean();
        if (users && users.length > 0) {
          return users.map((u: any) => this.sanitizeUser({ ...u, id: u.id, _id: undefined }));
        }
        if (isProduction) return [];
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while listing users.');
        }
        console.warn('Mongo listUsers failed:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return authStore.users.map((u) => this.sanitizeUser(u));
  },

  getRawUsers(): User[] {
    return [...authStore.users];
  },

  async getAllUsers(): Promise<User[]> {
    return this.listUsers();
  },

  async hasAdminUser(): Promise<boolean> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    if (isMongoConfigured()) {
      try {
        const adminCount = await UserModel.countDocuments({ role: { $in: ['admin', 'super_admin'] } });
        return adminCount > 0;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while checking admin presence.');
        }
        console.warn('Mongo countDocuments failed:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return authStore.users.some((u) => u.role === 'admin' || u.role === 'super_admin');
  },

  async deleteUser(userId: string): Promise<boolean> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await this.deleteUserSessions(userId);
        const res = await UserModel.deleteOne({ id: userId });
        return res.deletedCount > 0;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while deleting user.');
      }
    }

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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
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

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await UserSessionModel.create(session);
        return session;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating user session.');
      }
    }

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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    if (isMongoConfigured()) {
      try {
        const found = await UserSessionModel.findOne({ id: sessionId }).lean();
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return { ...found, id: (found as any).id, _id: undefined } as UserSession;
        }
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching user session.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return authStore.sessions.find(
      (s) => s.id === sessionId && new Date(s.expiresAt).getTime() > Date.now()
    );
  },

  async deleteSession(sessionId: string): Promise<void> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await UserSessionModel.deleteOne({ id: sessionId });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while deleting session.');
      }
    }

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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await UserSessionModel.deleteMany({ userId });
        await RefreshTokenModel.deleteMany({ userId });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while deleting user sessions.');
      }
    }

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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const record: RefreshTokenRecord = {
      id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...data,
      isRevoked: false,
      createdAt: new Date().toISOString(),
    };

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await RefreshTokenModel.create(record);
        return record;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while storing refresh token.');
      }
    }

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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    if (isMongoConfigured()) {
      try {
        const found = await RefreshTokenModel.findOne({ tokenHash }).lean();
        if (found) {
          return { ...found, id: (found as any).id, _id: undefined } as RefreshTokenRecord;
        }
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching refresh token.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return authStore.refreshTokens.find((r) => r.tokenHash === tokenHash);
  },

  async revokeTokenFamily(familyId: string): Promise<void> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await RefreshTokenModel.updateMany({ familyId }, { isRevoked: true });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while revoking token family.');
      }
    }

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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const record: PasswordResetToken = {
      id: `prt-${Date.now()}`,
      userId,
      token,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await PasswordResetTokenModel.deleteMany({ userId });
        await PasswordResetTokenModel.create(record);
        return record;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating password reset token.');
      }
    }

    authStore.passwordResetTokens = authStore.passwordResetTokens.filter((t) => t.userId !== userId);
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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    if (isMongoConfigured()) {
      try {
        const found = await PasswordResetTokenModel.findOne({ token, usedAt: { $exists: false } }).lean();
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return { ...found, id: (found as any).id, _id: undefined } as PasswordResetToken;
        }
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while validating reset token.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return authStore.passwordResetTokens.find(
      (t) => t.token === token && !t.usedAt && new Date(t.expiresAt).getTime() > Date.now()
    );
  },

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const now = new Date().toISOString();

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await PasswordResetTokenModel.updateOne({ token }, { usedAt: now });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while invalidating reset token.');
      }
    }

    const item = authStore.passwordResetTokens.find((t) => t.token === token);
    if (item) item.usedAt = now;

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await PasswordResetTokenModel.updateOne({ token }, { usedAt: now });
      } catch {}
    }
  },

  // --------------------------------------------------------------------------
  // 6-Digit Email Verification Tokens / OTPs
  // --------------------------------------------------------------------------
  async createEmailVerificationToken(userId: string, token: string): Promise<EmailVerificationToken> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const record: EmailVerificationToken = {
      id: `evt-${Date.now()}`,
      userId,
      token,
      otp: token.slice(0, 6),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await EmailVerificationTokenModel.create(record);
        return record;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating verification token.');
      }
    }

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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    if (isMongoConfigured()) {
      try {
        const found = await EmailVerificationTokenModel.findOne({ token, usedAt: { $exists: false } }).lean();
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return { ...found, id: (found as any).id, _id: undefined } as EmailVerificationToken;
        }
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while validating verification token.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return authStore.emailVerificationTokens.find(
      (t) => t.token === token && !t.usedAt && new Date(t.expiresAt).getTime() > Date.now()
    );
  },

  async markEmailVerificationTokenUsed(token: string): Promise<void> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const now = new Date().toISOString();

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await EmailVerificationTokenModel.updateOne({ token }, { usedAt: now });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while marking verification token used.');
      }
    }

    const item = authStore.emailVerificationTokens.find((t) => t.token === token);
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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanEmail = email.toLowerCase().trim();

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

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await EmailVerificationTokenModel.deleteMany({ email: cleanEmail, type, usedAt: { $exists: false } });
        await EmailVerificationTokenModel.create(record);
        return record;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating verification OTP.');
      }
    }

    authStore.emailVerificationTokens = authStore.emailVerificationTokens.filter(
      (t) => !(t.email?.toLowerCase() === cleanEmail && t.type === type && !t.usedAt)
    );
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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
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
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while validating verification OTP.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const now = new Date().toISOString();

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await EmailVerificationTokenModel.updateOne({ id }, { usedAt: now });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while marking verification OTP used.');
      }
    }

    const item = authStore.emailVerificationTokens.find((t) => t.id === id);
    if (item) item.usedAt = now;

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await EmailVerificationTokenModel.updateOne({ id }, { usedAt: now });
      } catch {}
    }
  },

  async findActiveEmailVerificationOtp(
    email: string,
    type?: string
  ): Promise<EmailVerificationToken | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConfigured()) {
      try {
        const query: any = {
          email: cleanEmail,
          usedAt: { $exists: false },
        };
        if (type) query.type = type;
        const found = await EmailVerificationTokenModel.findOne(query).sort({ createdAt: -1 }).lean();
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return { ...found, id: (found as any).id, _id: undefined } as EmailVerificationToken;
        }
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching active verification OTP.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }

    return authStore.emailVerificationTokens.find(
      (t) =>
        t.email?.toLowerCase() === cleanEmail &&
        (!type || t.type === type) &&
        !t.usedAt &&
        new Date(t.expiresAt).getTime() > Date.now()
    );
  },

  async incrementEmailVerificationOtpAttempts(
    email: string,
    type?: string
  ): Promise<{ attempts: number; isLockedOut: boolean }> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanEmail = email.toLowerCase().trim();

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        const query: any = { email: cleanEmail, usedAt: { $exists: false } };
        if (type) query.type = type;
        const updated = await EmailVerificationTokenModel.findOneAndUpdate(
          query,
          { $inc: { attempts: 1 } },
          { new: true, sort: { createdAt: -1 } }
        );
        if (updated) {
          const attempts = updated.attempts || 1;
          if (attempts >= 5) {
            await EmailVerificationTokenModel.updateOne({ id: updated.id }, { usedAt: new Date().toISOString() });
          }
          return { attempts, isLockedOut: attempts >= 5 };
        }
        return { attempts: 5, isLockedOut: true };
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating verification attempts.');
      }
    }

    const item = authStore.emailVerificationTokens.find(
      (t) =>
        t.email?.toLowerCase() === cleanEmail &&
        (!type || t.type === type) &&
        !t.usedAt &&
        new Date(t.expiresAt).getTime() > Date.now()
    );

    let attempts = 1;
    if (item) {
      item.attempts = (item.attempts || 0) + 1;
      attempts = item.attempts;
      if (attempts >= 5) {
        item.usedAt = new Date().toISOString();
      }
    }

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const query: any = { email: cleanEmail, usedAt: { $exists: false } };
        if (type) query.type = type;
        const updated = await EmailVerificationTokenModel.findOneAndUpdate(
          query,
          { $inc: { attempts: 1 } },
          { new: true, sort: { createdAt: -1 } }
        );
        if (updated) {
          attempts = updated.attempts || attempts;
          if (attempts >= 5) {
            await EmailVerificationTokenModel.updateOne({ id: updated.id }, { usedAt: new Date().toISOString() });
          }
        }
      } catch {}
    }

    return { attempts, isLockedOut: attempts >= 5 };
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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanEmail = email.toLowerCase().trim();

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

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await PasswordResetTokenModel.deleteMany({ email: cleanEmail, usedAt: { $exists: false } });
        await PasswordResetTokenModel.create(record);
        return record;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating reset OTP.');
      }
    }

    authStore.passwordResetTokens = authStore.passwordResetTokens.filter(
      (t) => !(t.email?.toLowerCase() === cleanEmail && !t.usedAt)
    );
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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
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
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while validating reset OTP.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
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
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const now = new Date().toISOString();

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await PasswordResetTokenModel.updateOne({ id }, { usedAt: now });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while marking reset OTP used.');
      }
    }

    const item = authStore.passwordResetTokens.find((t) => t.id === id);
    if (item) item.usedAt = now;

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        await PasswordResetTokenModel.updateOne({ id }, { usedAt: now });
      } catch {}
    }
  },

  async findActivePasswordResetOtp(email: string): Promise<PasswordResetToken | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConfigured()) {
      try {
        const found = await PasswordResetTokenModel.findOne({
          email: cleanEmail,
          usedAt: { $exists: false },
        }).sort({ createdAt: -1 }).lean();
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return { ...found, id: (found as any).id, _id: undefined } as PasswordResetToken;
        }
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching active reset OTP.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }

    return authStore.passwordResetTokens.find(
      (t) =>
        t.email?.toLowerCase() === cleanEmail &&
        !t.usedAt &&
        new Date(t.expiresAt).getTime() > Date.now()
    );
  },

  async incrementPasswordResetOtpAttempts(email: string): Promise<{ attempts: number; isLockedOut: boolean }> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanEmail = email.toLowerCase().trim();

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        const updated = await PasswordResetTokenModel.findOneAndUpdate(
          { email: cleanEmail, usedAt: { $exists: false } },
          { $inc: { attempts: 1 } },
          { new: true, sort: { createdAt: -1 } }
        );
        if (updated) {
          const attempts = updated.attempts || 1;
          if (attempts >= 5) {
            await PasswordResetTokenModel.updateOne({ id: updated.id }, { usedAt: new Date().toISOString() });
          }
          return { attempts, isLockedOut: attempts >= 5 };
        }
        return { attempts: 5, isLockedOut: true };
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating reset attempts.');
      }
    }

    const item = authStore.passwordResetTokens.find(
      (t) =>
        t.email?.toLowerCase() === cleanEmail &&
        !t.usedAt &&
        new Date(t.expiresAt).getTime() > Date.now()
    );

    let attempts = 1;
    if (item) {
      item.attempts = (item.attempts || 0) + 1;
      attempts = item.attempts;
      if (attempts >= 5) {
        item.usedAt = new Date().toISOString();
      }
    }

    if (isMongoConfigured()) {
      try {
        await connectToDatabase();
        const updated = await PasswordResetTokenModel.findOneAndUpdate(
          { email: cleanEmail, usedAt: { $exists: false } },
          { $inc: { attempts: 1 } },
          { new: true, sort: { createdAt: -1 } }
        );
        if (updated) {
          attempts = updated.attempts || attempts;
          if (attempts >= 5) {
            await PasswordResetTokenModel.updateOne({ id: updated.id }, { usedAt: new Date().toISOString() });
          }
        }
      } catch {}
    }

    return { attempts, isLockedOut: attempts >= 5 };
  },

  // --------------------------------------------------------------------------
  // NGO Accreditation Applications
  // --------------------------------------------------------------------------
  async createNGOApplication(data: Omit<NGOApplication, 'id' | 'status' | 'createdAt'>): Promise<NGOApplication> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const newApp: NGOApplication = {
      id: `ngo-app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      focalPersonEmail: data.focalPersonEmail.toLowerCase().trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        await NGOApplicationModel.create(newApp);
        return newApp;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating NGO application.');
      }
    }

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
    const isProduction = process.env.NODE_ENV === 'production';
    if (isMongoConfigured()) {
      try {
        const query = status ? { status } : {};
        const list = await NGOApplicationModel.find(query).sort({ createdAt: -1 }).lean();
        if (list && list.length > 0) {
          return list.map((a: any) => ({ ...a, id: a.id, _id: undefined }));
        }
        if (isProduction) return [];
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while listing NGO applications.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return status ? authStore.ngoApplications.filter((a) => a.status === status) : [...authStore.ngoApplications];
  },

  async findNGOApplicationById(id: string): Promise<NGOApplication | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    if (isMongoConfigured()) {
      try {
        const found = await NGOApplicationModel.findOne({ id }).lean();
        if (found) return { ...found, id: (found as any).id, _id: undefined } as NGOApplication;
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching NGO application.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return authStore.ngoApplications.find((a) => a.id === id);
  },

  async updateNGOApplication(id: string, updates: Partial<NGOApplication>): Promise<NGOApplication | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const now = new Date().toISOString();

    if (isProduction) {
      if (!isMongoConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await connectToDatabase();
        const updated = await NGOApplicationModel.findOneAndUpdate(
          { id },
          { ...updates, updatedAt: now },
          { new: true }
        ).lean();
        if (updated) return { ...updated, id: (updated as any).id, _id: undefined } as NGOApplication;
        return undefined;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating NGO application.');
      }
    }

    const app = authStore.ngoApplications.find((a) => a.id === id);
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
