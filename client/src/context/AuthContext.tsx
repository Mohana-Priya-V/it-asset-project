import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, initialUsers } from '@/data/mockData';
import { usersApi, API_BASE_URL } from '@/services/api';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  activateAccount: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Fetch users from backend on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const backendUsers = await usersApi.getAll();
        if (backendUsers && backendUsers.length > 0) {
          setUsers(backendUsers as User[]);
        }
      } catch (error) {
        console.error('Error fetching users from backend:', error);
        // Keep the initialUsers if backend fetch fails
      }
    };

    fetchUsers();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error || 'Login failed' };
      }

      const data = await response.json();
      if (data.success && data.user) {
        const user: User = {
          id: data.user.id.toString(),
          name: data.user.name,
          email: data.user.email,
          password: '', // Not stored in frontend
          role: data.user.role as any,
          department: data.user.department || '',
          phone: data.user.phone || '',
          status: data.user.status || 'active',
          createdAt: data.user.created_at || new Date().toISOString(),
          isFirstLogin: false
        };
        setCurrentUser(user);
        return { success: true, message: 'Login successful' };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const activateAccount = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error || 'Activation failed' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Activation error:', error);
      return { success: false, message: 'Activation failed' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, users, setUsers, login, logout, activateAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
