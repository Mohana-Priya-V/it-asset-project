// ============================================
// API Service - Configure your Flask backend URL
// ============================================

// Read from VITE_API_URL environment variable (or fallback to localhost)
const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CLEAN_API_URL = RAW_API_URL.replace(/\/+$|\s+/g, '');
export const API_BASE_URL = CLEAN_API_URL.endsWith('/api')
  ? CLEAN_API_URL
  : `${CLEAN_API_URL}/api`;

// Helper for making API requests
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options?.method || 'GET';
  console.log(`[API] ${method} ${url}`);
  if (options?.body) {
    console.log(`[API] Body:`, options.body);
  }
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ message: res.statusText }));
    console.error(`[API] Error ${res.status}: ${JSON.stringify(errBody)}`);
    // Throw the parsed body so callers can access error.detail or error.error
    throw errBody;
  }

  const data = await res.json();
  console.log(`[API] Response:`, data);
  return data;
}

// ============ AUTH / USERS ============

export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; message: string; user?: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  activateAccount: (email: string, password: string) =>
    request<{ success: boolean; message: string }>('/auth/activate', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const usersApi = {
  getAll: () => request<any[]>('/users'),

  create: (user: any) =>
    request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  update: (id: string, data: any) =>
    request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
};

// ============ ASSETS ============

export const assetsApi = {
  getAll: () => request<any[]>('/assets'),

  getExpiry: () => request<any[]>('/assets/expiry/all'),

  create: (asset: any) =>
    request<any>('/assets', {
      method: 'POST',
      body: JSON.stringify(asset),
    }),

  update: (id: string, data: any) =>
    request<any>(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/assets/${id}`, { method: 'DELETE' }),
};

// ============ ASSIGNMENTS ============

export const assignmentsApi = {
  getAll: () => request<any[]>('/assignments'),

  getHistory: () => request<any[]>('/assignments/history'),

  assign: (data: { assetId: string; userId: string; assignedBy: string }) =>
    request<any>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  returnAsset: (assignmentId: string, performedBy: string) =>
    request<any>(`/assignments/${assignmentId}/return`, {
      method: 'POST',
      body: JSON.stringify({ performedBy }),
    }),
};

// ============ REPAIR REQUESTS / ISSUES ============

export const issuesApi = {
  getAll: () => request<any[]>('/issues'),

  create: (issue: any) =>
    request<any>('/issues', {
      method: 'POST',
      body: JSON.stringify(issue),
    }),

  update: (id: string, data: any) =>
    request<any>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ============ DEPARTMENTS ============

export const departmentsApi = {
  getAll: () => request<any[]>('/departments'),

  create: (dept: any) =>
    request<any>('/departments', {
      method: 'POST',
      body: JSON.stringify(dept),
    }),
};
