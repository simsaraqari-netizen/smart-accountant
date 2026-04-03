import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  username: string;
  password: string;
  role: 'super_admin' | 'admin' | 'user';
}

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERS: User[] = [
  { username: 'مدير النظام', password: '65814909', role: 'super_admin' },
  { username: 'ابوابرهيم', password: '12345678', role: 'user' },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const user = DEFAULT_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
