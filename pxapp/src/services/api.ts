import { HospitalUnit, Bottleneck, AuditLog, DbHealthStatus, User, AuthSession, CategoryItem, DepartmentItem } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('sankara_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options?.headers
      },
      ...options
    });

    if (!res.ok) {
      let errDetail = `HTTP error ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson.error) errDetail = errorJson.error;
      } catch (_) {}
      throw new Error(errDetail);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Authentication (supports email or Employee ID)
  login: async (identifier: string, password?: string): Promise<AuthSession> => {
    const data = await fetchJson<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, email: identifier, empId: identifier, password })
    });
    if (data.token) {
      localStorage.setItem('sankara_auth_token', data.token);
      localStorage.setItem('sankara_auth_user', JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    return fetchJson<User>('/auth/me');
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return fetchJson<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  logout: () => {
    localStorage.removeItem('sankara_auth_token');
    localStorage.removeItem('sankara_auth_user');
  },

  // Users Directory (Super Admin Only CRUD)
  getUsers: async (): Promise<User[]> => {
    return fetchJson<User[]>('/users');
  },

  createUser: async (userData: {
    name: string;
    email?: string;
    orgEmail?: string;
    role: string;
    unitId?: string;
    unit?: string;
    empId?: string;
    designation?: string;
  }): Promise<User> => {
    return fetchJson<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (id: string, updates: {
    name?: string;
    email?: string;
    orgEmail?: string;
    role?: string;
    unitId?: string;
    unit?: string;
    empId?: string;
    designation?: string;
  }): Promise<User> => {
    return fetchJson<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  deleteUser: async (id: string): Promise<{ success: boolean; deletedId: string }> => {
    return fetchJson<{ success: boolean; deletedId: string }>(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  resetUserPassword: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchJson<{ success: boolean; message: string }>(`/users/${id}/reset-password`, {
      method: 'POST'
    });
  },

  // Health & DB Connection Status
  getHealth: async (): Promise<DbHealthStatus> => {
    return fetchJson<DbHealthStatus>('/health');
  },

  // Units
  getUnits: async (): Promise<HospitalUnit[]> => {
    return fetchJson<HospitalUnit[]>('/units');
  },

  getUnit: async (id: string): Promise<HospitalUnit> => {
    return fetchJson<HospitalUnit>(`/units/${id}`);
  },

  updateUnit: async (id: string, updates: Partial<HospitalUnit>): Promise<HospitalUnit> => {
    return fetchJson<HospitalUnit>(`/units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  assignUnitHead: async (unitId: string, headData: {
    name: string;
    email: string;
    empId?: string;
    designation?: string;
    password?: string;
    cmo?: string;
  }): Promise<{ success: boolean; message: string; unit: HospitalUnit; user: User }> => {
    return fetchJson<{ success: boolean; message: string; unit: HospitalUnit; user: User }>(`/units/${unitId}/unit-head`, {
      method: 'POST',
      body: JSON.stringify(headData)
    });
  },

  initializeUnitAssessment: async (unitId: string): Promise<{ success: boolean; unit: HospitalUnit }> => {
    return fetchJson<{ success: boolean; unit: HospitalUnit }>(`/units/${unitId}/initialize`, {
      method: 'POST'
    });
  },

  // Bottlenecks
  createBottleneck: async (data: {
    unitId: string;
    title: string;
    category: string;
    department?: string;
    status?: string;
    percentComplete?: number;
    owner?: string;
    impactLevel?: 'High' | 'Medium' | 'Low';
    targetDate?: string;
    notes?: string;
    remarks?: string;
    beforePhotos?: string[];
    afterPhotos?: string[];
    userRole?: string;
  }): Promise<Bottleneck> => {
    return fetchJson<Bottleneck>('/bottlenecks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateBottleneck: async (
    id: string,
    updates: Partial<Bottleneck> & { userRole?: string }
  ): Promise<Bottleneck> => {
    return fetchJson<Bottleneck>(`/bottlenecks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  deleteBottleneck: async (id: string, userRole?: string): Promise<{ success: boolean; deletedId: string; unitId: string }> => {
    return fetchJson<{ success: boolean; deletedId: string; unitId: string }>(
      `/bottlenecks/${id}${userRole ? `?userRole=${encodeURIComponent(userRole)}` : ''}`,
      {
        method: 'DELETE'
      }
    );
  },

  // Directives & Comments
  addComment: async (bottleneckId: string, commentData: {
    authorName: string;
    authorRole: string;
    authorEmail?: string;
    message: string;
  }): Promise<Bottleneck> => {
    return fetchJson<Bottleneck>(`/bottlenecks/${bottleneckId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData)
    });
  },

  // Categories API
  getCategories: async (): Promise<CategoryItem[]> => {
    return fetchJson<CategoryItem[]>('/categories');
  },

  createCategory: async (categoryData: { name: string; department?: string; description?: string }): Promise<CategoryItem> => {
    return fetchJson<CategoryItem>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  },

  deleteCategory: async (id: string): Promise<{ success: boolean; deletedId: string }> => {
    return fetchJson<{ success: boolean; deletedId: string }>(`/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // Departments API
  getDepartments: async (): Promise<DepartmentItem[]> => {
    return fetchJson<DepartmentItem[]>('/departments');
  },

  createDepartment: async (deptData: { name: string; code?: string; headContact?: string }): Promise<DepartmentItem> => {
    return fetchJson<DepartmentItem>('/departments', {
      method: 'POST',
      body: JSON.stringify(deptData)
    });
  },

  deleteDepartment: async (id: string): Promise<{ success: boolean; deletedId: string }> => {
    return fetchJson<{ success: boolean; deletedId: string }>(`/departments/${id}`, {
      method: 'DELETE'
    });
  },

  // Database Utilities
  resetDatabase: async (): Promise<{ success: boolean; message: string }> => {
    return fetchJson<{ success: boolean; message: string }>('/db/reset', {
      method: 'POST'
    });
  },

  seedAllUnits: async (): Promise<{ success: boolean; message: string }> => {
    return fetchJson<{ success: boolean; message: string }>('/db/seed-all', {
      method: 'POST'
    });
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return fetchJson<AuditLog[]>('/audit-logs');
  }
};
