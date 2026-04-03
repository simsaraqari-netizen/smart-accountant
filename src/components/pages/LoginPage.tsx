import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (!username || !password) {
        setError('يرجى إدخال اسم المستخدم وكلمة المرور');
        setIsLoading(false);
        return;
      }

      const success = login(username, password);
      if (!success) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleDemoAdminLogin = () => {
    setUsername('مدير النظام');
    setPassword('6581490
cd "/Users/masmastech/Library/CloudStorage/GoogleDrive-simsaraqari@gmail.com/My Drive/المحاسب الذكي/المحاسب-الذكي---smart-accountant" && git add . && git commit -m "Fix LoginPage - remove Firebase auth and use local authentication only" && git push
cat > "/Users/masmastech/Library/CloudStorage/GoogleDrive-simsaraqari@gmail.com/My Drive/المحاسب الذكي/المحاسب-الذكي---smart-accountant/src/auth/AuthContext.tsx" << 'EOF'
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
      localStorage.setItem('smartAccountant_currentUser', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('smartAccountant_currentUser');
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
