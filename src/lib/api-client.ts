/**
 * ReliefAI Enterprise Client & Server API Service Layer
 *
 * Provides canonical URL resolution and type-safe integration for the NestJS REST API
 * running on port 5001. Handles dual-token JWT headers, credentials inclusion,
 * and seamless fallback across client and server execution environments.
 */

import { UserRole, User } from './types';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || 'http://localhost:5001';
  }
  // Browser calls stay on the frontend origin so HttpOnly cookies reach middleware.
  return '/api';
}

/**
 * Maps frontend canonical paths to NestJS backend routes.
 */
export function resolveNestPath(endpoint: string): string {
  let path = endpoint.trim();
  if (path.startsWith('/api/')) {
    path = path.slice(4); // Remove leading /api
  } else if (path.startsWith('api/')) {
    path = path.slice(3);
  }

  // Canonical route mappings between ReliefAI and NestJS
  if (path === '/auth/ngo-apply') return '/ngo-applications';
  if (path === '/admin/ngo-applications') return '/ngo-applications';
  if (path.startsWith('/admin/ngo-applications/') && path.endsWith('/review')) {
    return path.replace('/admin/ngo-applications/', '/ngo-applications/');
  }

  return path.startsWith('/') ? path : `/${path}`;
}

export function apiUrl(endpoint: string): string {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  const cleanPath = resolveNestPath(endpoint);
  return `${base}${cleanPath}`;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = apiUrl(endpoint);
  const headers = new Headers(options.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // If client-side token exists in localStorage, pass as Bearer token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('reliefai_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const mergedOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers,
  };

  return fetch(url, mergedOptions);
}

// -----------------------------------------------------------------------------
// Typed API Services
// -----------------------------------------------------------------------------

export const authApi = {
  async login(email: string, password: string, rememberMe = false) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
    return res;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    organization?: string;
    badgeNumber?: string;
    assignedZone?: string;
  }) {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async me(token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/auth/me', { headers, cache: 'no-store' });
  },

  async refresh(refreshToken?: string) {
    return apiFetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  async logout() {
    return apiFetch('/auth/logout', { method: 'POST' });
  },

  async changePassword(currentPassword: string, newPassword: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/auth/change-password', {
      method: 'POST',
      headers,
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async updateProfile(updates: Partial<User>, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/auth/profile', {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
  },
};

export const userApi = {
  async getUsers(token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/users', { headers });
  },

  async getById(id: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch(`/users/${id}`, { headers });
  },

  async create(data: any, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/users', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch(`/users/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  },

  async delete(id: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch(`/users/${id}`, {
      method: 'DELETE',
      headers,
    });
  },
};

export const disasterApi = {
  async getAll(params?: Record<string, string | number>) {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiFetch(`/disasters${query}`);
  },

  async getById(id: string) {
    return apiFetch(`/disasters/${id}`);
  },

  async create(data: any, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/disasters', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  },
};

export const sosApi = {
  async getAll(params?: { priority?: string; status?: string }) {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiFetch(`/sos${query}`);
  },

  async getById(id: string) {
    return apiFetch(`/sos/${id}`);
  },

  async create(data: any) {
    return apiFetch('/sos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async dispatch(sosId: string, teamId: string, etaMinutes?: number, note?: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch(`/sos/${sosId}/dispatch`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ teamId, etaMinutes, note }),
    });
  },
};

export const shelterApi = {
  async getAll() {
    return apiFetch('/shelters');
  },

  async create(data: any, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/shelters', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  },

  async updateOccupancy(id: string, currentOccupancy: number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch(`/shelters/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ currentOccupancy }),
    });
  },
};

export const supplyApi = {
  async getAll() {
    return apiFetch('/supplies');
  },

  async dispatch(id: string, quantity: number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/supplies', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'dispatch', id, quantity }),
    });
  },

  async restock(id: string, quantity: number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/supplies', {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'restock', id, quantity }),
    });
  },
};

export const responderApi = {
  async getAll() {
    return apiFetch('/responders');
  },

  async updateStatus(teamId: string, status: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch(`/responders/${teamId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, teamId }),
    });
  },
};

export const donationApi = {
  async getAll() {
    return apiFetch('/donations');
  },

  async create(data: { donorName?: string; donorEmail?: string; amount: number; currency?: string; allocatedCause?: string; channel?: string }) {
    return apiFetch('/donations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const ngoApi = {
  async apply(data: any) {
    return apiFetch('/ngo-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAll(status?: string, token?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch(`/ngo-applications${query}`, { headers });
  },

  async review(id: string, action: 'approve' | 'reject', adminNotes?: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch(`/ngo-applications/${id}/review`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action, adminNotes }),
    });
  },
};

export const adminApi = {
  async getUsers(token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/admin/users', { headers });
  },

  async updateUser(userId: string, data: any, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch(`/admin/users/${userId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ ...data, userId }),
    });
  },

  async provisionUser(data: any, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch('/admin/users/provision', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  },

  async deleteUser(userId: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return apiFetch(`/admin/users/${userId}`, {
      method: 'DELETE',
      headers,
    });
  },
};

