import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
}

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  loginWithGoogle: (email: string) => void;
  logout: () => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GOOGLE_ADMIN = 'simsaraqari@gmail.com';

const LOCAL_USERS: any[] = [
  { username: 'مدير النظام', password: '65814909', email: 'admin@local', role: 'super_admin' },
  { username: 'ابوابرهيم', password: '12345678', email: 'user@local', role: 'user' },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const user = LOCAL_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      const authUser: User = { username: user.username, email: user.email, role: user.role };
      setCurrentUser(authUser);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const loginWithGoogle = (email: string) => {
    const role = email === GOOGLE_ADMIN ? 'super_admin' : 'admin';
    const authUser: User = { username: email.split('@')[0], email, role };
    setCurrentUser(authUser);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, loginWithGoogle, logout, isSuperAdmin }}>
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
