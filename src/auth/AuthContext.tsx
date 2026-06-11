import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
}

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: User | null;
  login: (username: string, password: string, rememberMe?: boolean) => boolean;
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

const STORAGE_KEY = 'smart_accountant_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // On mount, check if there is a saved session
  useEffect(() => {
    try {
      // Check localStorage first (persistent) then sessionStorage (session-only)
      const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.username && parsed?.role) {
          setCurrentUser(parsed);
          setIsLoggedIn(true);
        }
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const login = (username: string, password: string, rememberMe = false): boolean => {
    const user = LOCAL_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      const authUser: User = { username: user.username, email: user.email, role: user.role };
      setCurrentUser(authUser);
      setIsLoggedIn(true);
      // Save session based on "remember me" choice
      const data = JSON.stringify(authUser);
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, data);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, data);
        localStorage.removeItem(STORAGE_KEY);
      }
      return true;
    }
    return false;
  };

  const loginWithGoogle = (email: string) => {
    const role = email === GOOGLE_ADMIN ? 'super_admin' : 'admin';
    const authUser: User = { username: email.split('@')[0], email, role };
    setCurrentUser(authUser);
    setIsLoggedIn(true);
    // Google login always remembers
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
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
