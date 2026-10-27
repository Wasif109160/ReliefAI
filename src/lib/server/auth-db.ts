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
  prisma,
  isDatabaseConfigured,
  DatabaseUnavailableError,
  isDatabaseUnavailableError,
} from '../prisma';

// Pre-compute bcrypt hashes for seed users (in development & automated test environments)
const superAdminHash = bcrypt.hashSync('SuperAdmin@123456', 10);
const defaultHash = bcrypt.hashSync(process.env.SEED_ADMIN_PASSWORD || 'Admin@123456', 10);
const govHash = bcrypt.hashSync('Gov@123456', 10);
const ngoHash = bcrypt.hashSync('Ngo@123456', 10);
const rescueHash = bcrypt.hashSync('Rescue@123456', 10);
const volunteerHash = bcrypt.hashSync('Volunteer@123456', 10);
const citizenHash = bcrypt.hashSync('Citizen@123456', 10);

export const initialNGOApplications: NGOApplication[] = [
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

export const initialUsers: User[] = [
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

function mapPrismaUser(u: any): User {
  return {
    id: u.id,
    name: u.name,
    displayName: u.displayName || u.name,
    email: u.email,
    passwordHash: u.passwordHash || undefined,
    role: u.role as UserRole,
    isEmailVerified: Boolean(u.isEmailVerified),
    avatarUrl: u.avatarUrl || undefined,
    organization: u.organization || undefined,
    badgeNumber: u.badgeNumber || undefined,
    assignedTeamId: u.assignedTeamId || undefined,
    phone: u.phone || undefined,
    phoneNumber: u.phone || undefined,
    assignedZone: u.assignedZone || undefined,
    skills: Array.isArray(u.skills) ? u.skills : [],
    location: u.location ? (u.location as any) : undefined,
    failedLoginAttempts: u.failedLoginAttempts || 0,
    lockoutUntil: u.lockoutUntil || undefined,
    status: u.status as any,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
    updatedAt: u.updatedAt ? (u.updatedAt instanceof Date ? u.updatedAt.toISOString() : String(u.updatedAt)) : undefined,
  };
}

function mapPrismaSession(s: any): UserSession {
  return {
    id: s.id,
    userId: s.userId,
    token: s.token,
    ipAddress: s.ipAddress || undefined,
    userAgent: s.userAgent || undefined,
    expiresAt: s.expiresAt instanceof Date ? s.expiresAt.toISOString() : String(s.expiresAt),
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
  };
}

function mapPrismaRefreshToken(r: any): RefreshTokenRecord {
  return {
    id: r.id,
    userId: r.userId,
    tokenHash: r.tokenHash,
    familyId: r.familyId,
    isRevoked: Boolean(r.isRevoked),
    expiresAt: r.expiresAt instanceof Date ? r.expiresAt.toISOString() : String(r.expiresAt),
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  };
}

function mapPrismaPasswordResetToken(t: any): PasswordResetToken {
  return {
    id: t.id,
    userId: t.userId,
    email: t.email || undefined,
    token: t.token,
    otp: t.otp || undefined,
    attempts: t.attempts || 0,
    expiresAt: t.expiresAt instanceof Date ? t.expiresAt.toISOString() : String(t.expiresAt),
    usedAt: t.usedAt ? (t.usedAt instanceof Date ? t.usedAt.toISOString() : String(t.usedAt)) : undefined,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
  };
}

function mapPrismaEmailVerificationToken(t: any): EmailVerificationToken {
  return {
    id: t.id,
    userId: t.userId,
    email: t.email || undefined,
    token: t.token || undefined,
    otp: t.otp,
    type: t.type as any,
    attempts: t.attempts || 0,
    expiresAt: t.expiresAt instanceof Date ? t.expiresAt.toISOString() : String(t.expiresAt),
    usedAt: t.usedAt ? (t.usedAt instanceof Date ? t.usedAt.toISOString() : String(t.usedAt)) : undefined,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
  };
}

function mapPrismaNGOApplication(a: any): NGOApplication {
  return {
    id: a.id,
    organizationName: a.organizationName,
    registrationNumber: a.registrationNumber,
    focalPersonName: a.focalPersonName,
    focalPersonEmail: a.focalPersonEmail,
    focalPersonPhone: a.focalPersonPhone,
    website: a.website || undefined,
    hqAddress: a.hqAddress,
    operationalDistricts: Array.isArray(a.operationalDistricts) ? a.operationalDistricts : [],
    reliefCapabilities: Array.isArray(a.reliefCapabilities) ? a.reliefCapabilities : [],
    documentName: a.documentName || undefined,
    documentData: a.documentData || undefined,
    status: a.status as any,
    adminNotes: a.adminNotes || undefined,
    reviewedBy: a.reviewedBy || undefined,
    reviewedAt: a.reviewedAt ? (a.reviewedAt instanceof Date ? a.reviewedAt.toISOString() : String(a.reviewedAt)) : undefined,
    createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
    updatedAt: a.updatedAt ? (a.updatedAt instanceof Date ? a.updatedAt.toISOString() : String(a.updatedAt)) : undefined,
  };
}

let hasInitPrismaAuth = false;
async function initAuthDb() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !isDatabaseConfigured()) {
    throw new DatabaseUnavailableError('FATAL: DATABASE_URL is required and cannot be empty in production.');
  }

  if (hasInitPrismaAuth) return;

  if (isDatabaseConfigured()) {
    try {
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        if (allowDemoAccounts) {
          console.log('[AuthDB] Seeding initial test accounts into PostgreSQL (Development / Test Environment)...');
          for (const u of initialUsers) {
            await prisma.user.upsert({
              where: { email: u.email.toLowerCase().trim() },
              update: {},
              create: {
                id: u.id,
                name: u.name,
                displayName: u.displayName || u.name,
                email: u.email.toLowerCase().trim(),
                passwordHash: u.passwordHash,
                role: u.role as any,
                isEmailVerified: u.isEmailVerified,
                status: u.status || 'approved',
                badgeNumber: u.badgeNumber,
                organization: u.organization,
                phone: u.phone,
                skills: u.skills || [],
                assignedZone: u.assignedZone,
                assignedTeamId: u.assignedTeamId,
                location: u.location ? (u.location as any) : undefined,
                createdAt: new Date(u.createdAt),
              },
            });
          }
        } else {
          console.warn('[ReliefAI Security] Production database has 0 users. Auto-seeding of default demo accounts is disabled.');
        }
      }

      const ngoCount = await prisma.nGOApplication.count();
      if (ngoCount === 0) {
        for (const app of initialNGOApplications) {
          await prisma.nGOApplication.upsert({
            where: { registrationNumber: app.registrationNumber },
            update: {},
            create: {
              id: app.id,
              organizationName: app.organizationName,
              registrationNumber: app.registrationNumber,
              focalPersonName: app.focalPersonName,
              focalPersonEmail: app.focalPersonEmail.toLowerCase().trim(),
              focalPersonPhone: app.focalPersonPhone,
              website: app.website,
              hqAddress: app.hqAddress,
              operationalDistricts: app.operationalDistricts,
              reliefCapabilities: app.reliefCapabilities,
              documentName: app.documentName,
              status: app.status as any,
              reviewedBy: app.reviewedBy,
              reviewedAt: app.reviewedAt ? new Date(app.reviewedAt) : undefined,
              createdAt: new Date(app.createdAt),
            },
          });
        }
      }

      hasInitPrismaAuth = true;
    } catch (e) {
      hasInitPrismaAuth = false;
      if (isProduction) {
        console.error('[ReliefAI AuthDB] Failed to establish database connection:', e instanceof Error ? e.message : e);
        throw isDatabaseUnavailableError(e)
          ? e
          : new DatabaseUnavailableError('Failed to establish database connection in production.');
      }
      console.warn('[ReliefAI Auth] PostgreSQL connection fallback to memory:', e);
    }
  }
}

export const authDb = {
  // Users
  async findUserByEmail(email: string): Promise<User | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanEmail = email.toLowerCase().trim();

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });
        if (found) {
          const user = mapPrismaUser(found);
          const idx = authStore.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
          if (idx !== -1) authStore.users[idx] = user;
          else authStore.users.push(user);
          return user;
        }
        if (isProduction) return undefined;
      } catch (err) {
        console.error('[ReliefAI AuthDB] User lookup failed for email query:', err instanceof Error ? err.message : err);
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed during user lookup.');
        }
        console.warn('Prisma findUserByEmail failed, using memory:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
  },

  async findUserById(id: string): Promise<User | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.user.findUnique({
          where: { id },
        });
        if (found) {
          return mapPrismaUser(found);
        }
        if (isProduction) return undefined;
      } catch (err) {
        console.error('[ReliefAI AuthDB] User lookup failed for ID query:', err instanceof Error ? err.message : err);
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed during user lookup.');
        }
        console.warn('Prisma findUserById failed:', err);
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
    id?: string;
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
    status?: 'active' | 'approved' | 'pending' | 'pending_approval' | 'rejected' | 'suspended';
  }): Promise<User> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const passwordHash = data.passwordHash || (data.password ? bcrypt.hashSync(data.password, 10) : '');

    const newUser: User = {
      id: data.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
      status: data.status || 'approved',
      createdAt: new Date().toISOString(),
    };

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.user.create({
          data: {
            id: newUser.id,
            name: newUser.name,
            displayName: newUser.displayName,
            email: newUser.email,
            passwordHash: newUser.passwordHash,
            role: newUser.role as any,
            isEmailVerified: newUser.isEmailVerified,
            phone: newUser.phone,
            organization: newUser.organization,
            badgeNumber: newUser.badgeNumber,
            assignedTeamId: newUser.assignedTeamId,
            assignedZone: newUser.assignedZone,
            skills: newUser.skills || [],
            status: newUser.status || 'approved',
            createdAt: new Date(newUser.createdAt),
          },
        });
        return mapPrismaUser(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating user.');
      }
    }

    authStore.users.push(newUser);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.user.create({
          data: {
            id: newUser.id,
            name: newUser.name,
            displayName: newUser.displayName,
            email: newUser.email,
            passwordHash: newUser.passwordHash,
            role: newUser.role as any,
            isEmailVerified: newUser.isEmailVerified,
            phone: newUser.phone,
            organization: newUser.organization,
            badgeNumber: newUser.badgeNumber,
            assignedTeamId: newUser.assignedTeamId,
            assignedZone: newUser.assignedZone,
            skills: newUser.skills || [],
            status: newUser.status || 'approved',
            createdAt: new Date(newUser.createdAt),
          },
        });
        return mapPrismaUser(created);
      } catch (err) {
        console.warn('Prisma createUser failed, saved in memory:', err);
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
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash, updatedAt: new Date(updatedAt) },
        });
        return true;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating password.');
      }
    }

    const user = authStore.users.find((u) => u.id === userId);
    if (user) {
      user.passwordHash = passwordHash;
      user.updatedAt = updatedAt;
    }

    if (isDatabaseConfigured()) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash, updatedAt: new Date(updatedAt) },
        });
      } catch (err) {
        console.warn('Prisma updateUserPassword failed:', err);
      }
    }
    return Boolean(user);
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const updatedAt = new Date().toISOString();

    const dataToUpdate: any = {
      updatedAt: new Date(updatedAt),
    };
    if (updates.name !== undefined) dataToUpdate.name = updates.name;
    if (updates.displayName !== undefined) dataToUpdate.displayName = updates.displayName;
    if (updates.email !== undefined) dataToUpdate.email = updates.email.toLowerCase().trim();
    if (updates.role !== undefined) dataToUpdate.role = updates.role as any;
    if (updates.isEmailVerified !== undefined) dataToUpdate.isEmailVerified = updates.isEmailVerified;
    if (updates.avatarUrl !== undefined) dataToUpdate.avatarUrl = updates.avatarUrl;
    if (updates.organization !== undefined) dataToUpdate.organization = updates.organization;
    if (updates.badgeNumber !== undefined) dataToUpdate.badgeNumber = updates.badgeNumber;
    if (updates.assignedTeamId !== undefined) dataToUpdate.assignedTeamId = updates.assignedTeamId;
    if (updates.phone !== undefined) dataToUpdate.phone = updates.phone;
    if (updates.assignedZone !== undefined) dataToUpdate.assignedZone = updates.assignedZone;
    if (updates.skills !== undefined) dataToUpdate.skills = updates.skills;
    if (updates.location !== undefined) dataToUpdate.location = updates.location as any;
    if (updates.failedLoginAttempts !== undefined) dataToUpdate.failedLoginAttempts = updates.failedLoginAttempts;
    if (updates.lockoutUntil !== undefined) dataToUpdate.lockoutUntil = updates.lockoutUntil;
    if (updates.status !== undefined) dataToUpdate.status = updates.status;

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: dataToUpdate,
        });
        return mapPrismaUser(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating user profile.');
      }
    }

    const user = authStore.users.find((u) => u.id === userId);
    if (user) {
      Object.assign(user, updates, { updatedAt });
    }

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: dataToUpdate,
        });
        return mapPrismaUser(updated);
      } catch (err) {
        console.warn('Prisma updateUserProfile failed:', err);
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
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isEmailVerified: true, updatedAt: new Date(updatedAt) },
        });
        return true;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while verifying user email.');
      }
    }

    const user = authStore.users.find((u) => u.id === userId);
    if (user) {
      user.isEmailVerified = true;
      user.updatedAt = updatedAt;
    }

    if (isDatabaseConfigured()) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isEmailVerified: true, updatedAt: new Date(updatedAt) },
        });
      } catch (err) {
        console.warn('Prisma verifyUserEmail failed:', err);
      }
    }
    return Boolean(user);
  },

  async listUsers(): Promise<User[]> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
        });
        if (users && users.length > 0) {
          return users.map((u) => this.sanitizeUser(mapPrismaUser(u)));
        }
        if (isProduction) return [];
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while listing users.');
        }
        console.warn('Prisma listUsers failed:', err);
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

    if (isDatabaseConfigured()) {
      try {
        const count = await prisma.user.count({
          where: {
            role: { in: ['admin', 'super_admin'] },
          },
        });
        return count > 0;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while checking admin presence.');
        }
        console.warn('Prisma count failed:', err);
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
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await this.deleteUserSessions(userId);
        await prisma.user.delete({ where: { id: userId } });
        return true;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while deleting user.');
      }
    }

    const idx = authStore.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      authStore.users.splice(idx, 1);
    }
    await this.deleteUserSessions(userId);

    if (isDatabaseConfigured()) {
      try {
        await prisma.user.delete({ where: { id: userId } });
      } catch (err) {
        console.warn('Prisma deleteUser failed:', err);
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
        token: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Browser',
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      };
    } else {
      sessionData = {
        userId: dataOrUserId.userId,
        token: dataOrUserId.token || `tok-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.userSession.create({
          data: {
            id: session.id,
            userId: session.userId,
            token: session.token,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            expiresAt: new Date(session.expiresAt),
            createdAt: new Date(session.createdAt),
          },
        });
        return mapPrismaSession(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating user session.');
      }
    }

    authStore.sessions.push(session);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.userSession.create({
          data: {
            id: session.id,
            userId: session.userId,
            token: session.token,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            expiresAt: new Date(session.expiresAt),
            createdAt: new Date(session.createdAt),
          },
        });
        return mapPrismaSession(created);
      } catch (err) {
        console.warn('Prisma createSession failed:', err);
      }
    }
    return session;
  },

  async findSession(sessionId: string): Promise<UserSession | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.userSession.findUnique({
          where: { id: sessionId },
        });
        if (found && new Date(found.expiresAt).getTime() > Date.now()) {
          return mapPrismaSession(found);
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
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await prisma.userSession.deleteMany({ where: { id: sessionId } });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while deleting session.');
      }
    }

    const idx = authStore.sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) authStore.sessions.splice(idx, 1);

    if (isDatabaseConfigured()) {
      try {
        await prisma.userSession.deleteMany({ where: { id: sessionId } });
      } catch {}
    }
  },

  async deleteUserSessions(userId: string): Promise<void> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await prisma.userSession.deleteMany({ where: { userId } });
        await prisma.refreshToken.deleteMany({ where: { userId } });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while deleting user sessions.');
      }
    }

    authStore.sessions = authStore.sessions.filter((s) => s.userId !== userId);
    authStore.refreshTokens = authStore.refreshTokens.filter((r) => r.userId !== userId);

    if (isDatabaseConfigured()) {
      try {
        await prisma.userSession.deleteMany({ where: { userId } });
        await prisma.refreshToken.deleteMany({ where: { userId } });
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
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.refreshToken.create({
          data: {
            id: record.id,
            userId: record.userId,
            tokenHash: record.tokenHash,
            familyId: record.familyId,
            isRevoked: record.isRevoked,
            expiresAt: new Date(record.expiresAt),
            createdAt: new Date(record.createdAt),
          },
        });
        return mapPrismaRefreshToken(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while storing refresh token.');
      }
    }

    authStore.refreshTokens.push(record);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.refreshToken.create({
          data: {
            id: record.id,
            userId: record.userId,
            tokenHash: record.tokenHash,
            familyId: record.familyId,
            isRevoked: record.isRevoked,
            expiresAt: new Date(record.expiresAt),
            createdAt: new Date(record.createdAt),
          },
        });
        return mapPrismaRefreshToken(created);
      } catch (err) {
        console.warn('Prisma storeRefreshToken failed:', err);
      }
    }
    return record;
  },

  async findRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.refreshToken.findUnique({
          where: { tokenHash },
        });
        if (found) {
          return mapPrismaRefreshToken(found);
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

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await prisma.refreshToken.updateMany({
          where: { tokenHash },
          data: { isRevoked: true },
        });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while revoking refresh token.');
      }
    }

    const token = authStore.refreshTokens.find((r) => r.tokenHash === tokenHash);
    if (token) token.isRevoked = true;

    if (isDatabaseConfigured()) {
      try {
        await prisma.refreshToken.updateMany({
          where: { tokenHash },
          data: { isRevoked: true },
        });
      } catch {}
    }
  },

  async revokeFamily(familyId: string): Promise<void> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await prisma.refreshToken.updateMany({
          where: { familyId },
          data: { isRevoked: true },
        });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while revoking refresh token family.');
      }
    }

    authStore.refreshTokens.forEach((r) => {
      if (r.familyId === familyId) r.isRevoked = true;
    });

    if (isDatabaseConfigured()) {
      try {
        await prisma.refreshToken.updateMany({
          where: { familyId },
          data: { isRevoked: true },
        });
      } catch {}
    }
  },

  // Password Reset Tokens
  async createPasswordResetToken(data: {
    userId: string;
    email?: string;
    token: string;
    otp?: string;
    expiresAt: string;
  }): Promise<PasswordResetToken> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    const record: PasswordResetToken = {
      id: `prt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: data.userId,
      email: data.email?.toLowerCase().trim(),
      token: data.token,
      otp: data.otp,
      attempts: 0,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
    };

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.passwordResetToken.create({
          data: {
            id: record.id,
            userId: record.userId,
            email: record.email,
            token: record.token,
            otp: record.otp,
            attempts: record.attempts || 0,
            expiresAt: new Date(record.expiresAt),
            createdAt: new Date(record.createdAt),
          },
        });
        return mapPrismaPasswordResetToken(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating password reset token.');
      }
    }

    authStore.passwordResetTokens.push(record);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.passwordResetToken.create({
          data: {
            id: record.id,
            userId: record.userId,
            email: record.email,
            token: record.token,
            otp: record.otp,
            attempts: record.attempts || 0,
            expiresAt: new Date(record.expiresAt),
            createdAt: new Date(record.createdAt),
          },
        });
        return mapPrismaPasswordResetToken(created);
      } catch (err) {
        console.warn('Prisma createPasswordResetToken failed:', err);
      }
    }
    return record;
  },

  async findPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.passwordResetToken.findUnique({
          where: { token },
        });
        if (found) {
          return mapPrismaPasswordResetToken(found);
        }
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching password reset token.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    return authStore.passwordResetTokens.find((t) => t.token === token);
  },

  async findPasswordResetTokenByOtp(email: string, otp: string): Promise<PasswordResetToken | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanEmail = email.toLowerCase().trim();

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.passwordResetToken.findFirst({
          where: {
            email: cleanEmail,
            otp,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (found) {
          return mapPrismaPasswordResetToken(found);
        }
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while validating password reset OTP.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    const now = Date.now();
    return authStore.passwordResetTokens
      .filter((t) => t.email?.toLowerCase() === cleanEmail && t.otp === otp && !t.usedAt && new Date(t.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  },

  async markPasswordResetTokenUsed(tokenId: string): Promise<void> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const usedAt = new Date().toISOString();

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await prisma.passwordResetToken.update({
          where: { id: tokenId },
          data: { usedAt: new Date(usedAt) },
        });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating password reset token.');
      }
    }

    const token = authStore.passwordResetTokens.find((t) => t.id === tokenId);
    if (token) token.usedAt = usedAt;

    if (isDatabaseConfigured()) {
      try {
        await prisma.passwordResetToken.update({
          where: { id: tokenId },
          data: { usedAt: new Date(usedAt) },
        });
      } catch {}
    }
  },

  async incrementPasswordResetAttempts(tokenId: string): Promise<number> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.passwordResetToken.update({
          where: { id: tokenId },
          data: { attempts: { increment: 1 } },
        });
        return updated.attempts;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while incrementing reset attempts.');
      }
    }

    const token = authStore.passwordResetTokens.find((t) => t.id === tokenId);
    if (token) {
      token.attempts = (token.attempts || 0) + 1;
      if (isDatabaseConfigured()) {
        try {
          await prisma.passwordResetToken.update({
            where: { id: tokenId },
            data: { attempts: { increment: 1 } },
          });
        } catch {}
      }
      return token.attempts;
    }
    return 0;
  },

  // Email Verification Tokens
  async createEmailVerificationToken(data: {
    userId: string;
    email?: string;
    token?: string;
    otp: string;
    type?: string;
    expiresAt: string;
  }): Promise<EmailVerificationToken> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    const record: EmailVerificationToken = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: data.userId,
      email: data.email?.toLowerCase().trim(),
      token: data.token,
      otp: data.otp,
      type: (data.type as any) || 'email_verification',
      attempts: 0,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
    };

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.emailVerificationToken.create({
          data: {
            id: record.id,
            userId: record.userId,
            email: record.email,
            token: record.token,
            otp: record.otp || '',
            type: record.type as any,
            attempts: record.attempts || 0,
            expiresAt: new Date(record.expiresAt),
            createdAt: new Date(record.createdAt),
          },
        });
        return mapPrismaEmailVerificationToken(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while creating verification token.');
      }
    }

    authStore.emailVerificationTokens.push(record);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.emailVerificationToken.create({
          data: {
            id: record.id,
            userId: record.userId,
            email: record.email,
            token: record.token,
            otp: record.otp || '',
            type: record.type as any,
            attempts: record.attempts || 0,
            expiresAt: new Date(record.expiresAt),
            createdAt: new Date(record.createdAt),
          },
        });
        return mapPrismaEmailVerificationToken(created);
      } catch (err) {
        console.warn('Prisma createEmailVerificationToken failed:', err);
      }
    }
    return record;
  },

  async findEmailVerificationToken(
    userId: string,
    otp: string,
    type: string = 'email_verification'
  ): Promise<EmailVerificationToken | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.emailVerificationToken.findFirst({
          where: {
            userId,
            otp,
            type: type as any,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (found) {
          return mapPrismaEmailVerificationToken(found);
        }
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while verifying token.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }
    const now = Date.now();
    return authStore.emailVerificationTokens
      .filter((t) => t.userId === userId && t.otp === otp && t.type === type && !t.usedAt && new Date(t.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  },

  async markEmailVerificationTokenUsed(tokenId: string): Promise<void> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const usedAt = new Date().toISOString();

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await prisma.emailVerificationToken.update({
          where: { id: tokenId },
          data: { usedAt: new Date(usedAt) },
        });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating verification token.');
      }
    }

    const token = authStore.emailVerificationTokens.find((t) => t.id === tokenId);
    if (token) token.usedAt = usedAt;

    if (isDatabaseConfigured()) {
      try {
        await prisma.emailVerificationToken.update({
          where: { id: tokenId },
          data: { usedAt: new Date(usedAt) },
        });
      } catch {}
    }
  },

  async incrementEmailVerificationAttempts(tokenId: string): Promise<number> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.emailVerificationToken.update({
          where: { id: tokenId },
          data: { attempts: { increment: 1 } },
        });
        return updated.attempts;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while incrementing verification attempts.');
      }
    }

    const token = authStore.emailVerificationTokens.find((t) => t.id === tokenId);
    if (token) {
      token.attempts = (token.attempts || 0) + 1;
      if (isDatabaseConfigured()) {
        try {
          await prisma.emailVerificationToken.update({
            where: { id: tokenId },
            data: { attempts: { increment: 1 } },
          });
        } catch {}
      }
      return token.attempts;
    }
    return 0;
  },

  async createEmailVerificationOtp(
    userId: string,
    email: string,
    otp: string,
    type: string = 'email_verification',
    expireMinutes: number = 15
  ): Promise<EmailVerificationToken> {
    const expiresAt = new Date(Date.now() + expireMinutes * 60000).toISOString();
    return this.createEmailVerificationToken({
      userId,
      email,
      otp,
      type,
      expiresAt,
    });
  },

  async findActiveEmailVerificationOtp(
    email: string,
    type: string = 'email_verification'
  ): Promise<EmailVerificationToken | undefined> {
    await initAuthDb();
    const cleanEmail = email.toLowerCase().trim();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.emailVerificationToken.findFirst({
          where: {
            email: cleanEmail,
            type: type as any,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (found) return mapPrismaEmailVerificationToken(found);
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching active verification OTP.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }

    const now = Date.now();
    return authStore.emailVerificationTokens
      .filter((t) => t.email?.toLowerCase() === cleanEmail && t.type === type && !t.usedAt && new Date(t.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  },

  async findValidEmailVerificationOtp(
    email: string,
    otp: string,
    type: string = 'email_verification'
  ): Promise<EmailVerificationToken | undefined> {
    await initAuthDb();
    const cleanEmail = email.toLowerCase().trim();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.emailVerificationToken.findFirst({
          where: {
            email: cleanEmail,
            otp,
            type: type as any,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (found) return mapPrismaEmailVerificationToken(found);
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while verifying OTP.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }

    const now = Date.now();
    return authStore.emailVerificationTokens
      .filter((t) => t.email?.toLowerCase() === cleanEmail && t.otp === otp && t.type === type && !t.usedAt && new Date(t.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  },

  async findValidEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.emailVerificationToken.findFirst({
          where: {
            OR: [{ token }, { id: token }],
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (found) return mapPrismaEmailVerificationToken(found);
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while finding verification token.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }

    const now = Date.now();
    return authStore.emailVerificationTokens
      .filter((t) => (t.token === token || t.id === token) && !t.usedAt && new Date(t.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  },

  async incrementEmailVerificationOtpAttempts(email: string): Promise<{ attempts: number; isLockedOut: boolean }> {
    const active = await this.findActiveEmailVerificationOtp(email);
    if (!active) {
      return { attempts: 0, isLockedOut: false };
    }

    const attempts = await this.incrementEmailVerificationAttempts(active.id);
    const isLockedOut = attempts >= 5;

    if (isLockedOut) {
      await this.markEmailVerificationTokenUsed(active.id);
    }

    return { attempts, isLockedOut };
  },

  async markEmailVerificationOtpUsed(targetOtpId: string): Promise<void> {
    return this.markEmailVerificationTokenUsed(targetOtpId);
  },

  async createPasswordResetOtp(
    userId: string,
    email: string,
    otp: string,
    expireMinutes: number = 15
  ): Promise<PasswordResetToken> {
    const expiresAt = new Date(Date.now() + expireMinutes * 60000).toISOString();
    return this.createPasswordResetToken({
      userId,
      email,
      token: `prt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      otp,
      expiresAt,
    });
  },

  async findActivePasswordResetOtp(email: string): Promise<PasswordResetToken | undefined> {
    await initAuthDb();
    const cleanEmail = email.toLowerCase().trim();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.passwordResetToken.findFirst({
          where: {
            email: cleanEmail,
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (found) return mapPrismaPasswordResetToken(found);
        if (isProduction) return undefined;
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching active password reset OTP.');
        }
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }

    const now = Date.now();
    return authStore.passwordResetTokens
      .filter((t) => t.email?.toLowerCase() === cleanEmail && !t.usedAt && new Date(t.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  },

  async findValidPasswordResetOtp(email: string, otp: string): Promise<PasswordResetToken | undefined> {
    return this.findPasswordResetTokenByOtp(email, otp);
  },

  async incrementPasswordResetOtpAttempts(email: string): Promise<{ attempts: number; isLockedOut: boolean }> {
    const active = await this.findActivePasswordResetOtp(email);
    if (!active) {
      return { attempts: 0, isLockedOut: false };
    }

    const attempts = await this.incrementPasswordResetAttempts(active.id);
    const isLockedOut = attempts >= 5;

    if (isLockedOut) {
      await this.markPasswordResetTokenUsed(active.id);
    }

    return { attempts, isLockedOut };
  },

  // Account Lockout
  async incrementFailedLoginAttempts(
    email: string,
    lockoutMinutes: number = 15
  ): Promise<{ attempts: number; lockoutUntil?: string }> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanEmail = email.toLowerCase().trim();

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user) return { attempts: 0 };

        const attempts = (user.failedLoginAttempts || 0) + 1;
        let lockoutUntil: string | undefined = undefined;
        if (attempts >= 5) {
          lockoutUntil = new Date(Date.now() + lockoutMinutes * 60000).toISOString();
        }

        await prisma.user.update({
          where: { email: cleanEmail },
          data: {
            failedLoginAttempts: attempts,
            lockoutUntil: lockoutUntil || null,
          },
        });
        return { attempts, lockoutUntil };
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while recording login attempt.');
      }
    }

    const user = authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) return { attempts: 0 };

    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    let lockoutUntil: string | undefined = undefined;
    if (user.failedLoginAttempts >= 5) {
      lockoutUntil = new Date(Date.now() + lockoutMinutes * 60000).toISOString();
      user.lockoutUntil = lockoutUntil;
    }

    if (isDatabaseConfigured()) {
      try {
        await prisma.user.update({
          where: { email: cleanEmail },
          data: {
            failedLoginAttempts: user.failedLoginAttempts,
            lockoutUntil: lockoutUntil || null,
          },
        });
      } catch {}
    }

    return { attempts: user.failedLoginAttempts, lockoutUntil };
  },

  async resetFailedLoginAttempts(email: string): Promise<void> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';
    const cleanEmail = email.toLowerCase().trim();

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        await prisma.user.updateMany({
          where: { email: cleanEmail },
          data: {
            failedLoginAttempts: 0,
            lockoutUntil: null,
          },
        });
        return;
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while resetting login attempts.');
      }
    }

    const user = authStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (user) {
      user.failedLoginAttempts = 0;
      user.lockoutUntil = undefined;
    }

    if (isDatabaseConfigured()) {
      try {
        await prisma.user.updateMany({
          where: { email: cleanEmail },
          data: {
            failedLoginAttempts: 0,
            lockoutUntil: null,
          },
        });
      } catch {}
    }
  },

  isAccountLocked(user: User): { locked: boolean; remainingMinutes?: number } {
    if (!user.lockoutUntil) return { locked: false };
    const lockoutTime = new Date(user.lockoutUntil).getTime();
    const now = Date.now();
    if (now >= lockoutTime) return { locked: false };
    const remainingMinutes = Math.ceil((lockoutTime - now) / 60000);
    return { locked: true, remainingMinutes };
  },

  // NGO Applications
  async createNGOApplication(
    data: Omit<NGOApplication, 'id' | 'createdAt' | 'status'>
  ): Promise<NGOApplication> {
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
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const created = await prisma.nGOApplication.create({
          data: {
            id: newApp.id,
            organizationName: newApp.organizationName,
            registrationNumber: newApp.registrationNumber,
            focalPersonName: newApp.focalPersonName,
            focalPersonEmail: newApp.focalPersonEmail,
            focalPersonPhone: newApp.focalPersonPhone,
            website: newApp.website,
            hqAddress: newApp.hqAddress,
            operationalDistricts: newApp.operationalDistricts || [],
            reliefCapabilities: newApp.reliefCapabilities || [],
            documentName: newApp.documentName,
            documentData: newApp.documentData,
            status: 'pending',
            createdAt: new Date(newApp.createdAt),
          },
        });
        return mapPrismaNGOApplication(created);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while saving NGO application.');
      }
    }

    authStore.ngoApplications.unshift(newApp);

    if (isDatabaseConfigured()) {
      try {
        const created = await prisma.nGOApplication.create({
          data: {
            id: newApp.id,
            organizationName: newApp.organizationName,
            registrationNumber: newApp.registrationNumber,
            focalPersonName: newApp.focalPersonName,
            focalPersonEmail: newApp.focalPersonEmail,
            focalPersonPhone: newApp.focalPersonPhone,
            website: newApp.website,
            hqAddress: newApp.hqAddress,
            operationalDistricts: newApp.operationalDistricts || [],
            reliefCapabilities: newApp.reliefCapabilities || [],
            documentName: newApp.documentName,
            documentData: newApp.documentData,
            status: 'pending',
            createdAt: new Date(newApp.createdAt),
          },
        });
        return mapPrismaNGOApplication(created);
      } catch (err) {
        console.warn('Prisma createNGOApplication failed, saved in memory:', err);
      }
    }

    return newApp;
  },

  async listNGOApplications(status?: string): Promise<NGOApplication[]> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const apps = await prisma.nGOApplication.findMany({
          where: status ? { status: status as any } : undefined,
          orderBy: { createdAt: 'desc' },
        });
        if (apps && apps.length > 0) {
          return apps.map((a) => mapPrismaNGOApplication(a));
        }
        if (isProduction) return [];
      } catch (err) {
        if (isProduction) {
          throw new DatabaseUnavailableError('Database query failed while fetching NGO applications.');
        }
        console.warn('Prisma listNGOApplications failed:', err);
      }
    } else if (isProduction) {
      throw new DatabaseUnavailableError('Persistent database is required in production.');
    }

    if (status) {
      return authStore.ngoApplications.filter((a) => a.status === status);
    }
    return [...authStore.ngoApplications];
  },

  async getNGOApplication(id: string): Promise<NGOApplication | undefined> {
    await initAuthDb();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isDatabaseConfigured()) {
      try {
        const found = await prisma.nGOApplication.findUnique({
          where: { id },
        });
        if (found) {
          return mapPrismaNGOApplication(found);
        }
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

    const dataToUpdate: any = {
      updatedAt: new Date(now),
    };
    if (updates.status !== undefined) dataToUpdate.status = updates.status as any;
    if (updates.adminNotes !== undefined) dataToUpdate.adminNotes = updates.adminNotes;
    if (updates.reviewedBy !== undefined) dataToUpdate.reviewedBy = updates.reviewedBy;
    if (updates.reviewedAt !== undefined) dataToUpdate.reviewedAt = new Date(updates.reviewedAt);

    if (isProduction) {
      if (!isDatabaseConfigured()) {
        throw new DatabaseUnavailableError('Persistent database is required in production.');
      }
      try {
        const updated = await prisma.nGOApplication.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaNGOApplication(updated);
      } catch (err) {
        throw new DatabaseUnavailableError('Database write failed while updating NGO application.');
      }
    }

    const app = authStore.ngoApplications.find((a) => a.id === id);
    if (app) {
      Object.assign(app, updates, { updatedAt: now });
    }

    if (isDatabaseConfigured()) {
      try {
        const updated = await prisma.nGOApplication.update({
          where: { id },
          data: dataToUpdate,
        });
        return mapPrismaNGOApplication(updated);
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

  async findNGOApplicationById(id: string): Promise<NGOApplication | undefined> {
    return this.getNGOApplication(id);
  },

  async revokeTokenFamily(familyId: string): Promise<void> {
    return this.revokeFamily(familyId);
  },

  async findValidPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    return this.findPasswordResetToken(token);
  },

  async markPasswordResetOtpUsed(tokenId: string): Promise<void> {
    return this.markPasswordResetTokenUsed(tokenId);
  },
};
