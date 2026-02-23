// ============================================
// API Service - Configure your Flask backend URL
// ============================================

// Change this to your Flask backend URL
const API_BASE_URL = 'http://localhost:5000/api';

// Helper for making API requests
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API request failed');
  }

  return res.json();
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
