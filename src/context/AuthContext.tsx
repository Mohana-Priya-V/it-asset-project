import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, initialUsers } from '@/data/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  activateAccount: (email: string, password: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  const login = useCallback((email: string, password: string) => {
    const user = users.find(u => u.email === email);
    if (!user) return { success: false, message: 'User not found' };
    if (user.status === 'inactive') return { success: false, message: 'Account is deactivated. Contact admin.' };
    if (user.isFirstLogin) return { success: false, message: 'Please activate your account first using "First Time Login?"' };
    if (user.password !== password) return { success: false, message: 'Invalid password' };
    setCurrentUser(user);
    return { success: true, message: 'Login successful' };
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const activateAccount = useCallback((email: string, password: string) => {
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) return { success: false, message: 'Email not found. Contact admin.' };
    const user = users[userIndex];
    if (!user.isFirstLogin) return { success: false, message: 'Account already activated. Please login.' };

    const updated = [...users];
    updated[userIndex] = { ...user, password, isFirstLogin: false, status: 'active' };
    setUsers(updated);
    return { success: true, message: 'Account activated! You can now login.' };
  }, [users]);

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
