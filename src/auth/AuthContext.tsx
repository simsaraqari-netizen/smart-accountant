import React, { createContext, useState, useContext, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  role: 'super_admin' | 'admin' | 'user';
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (username: string, password: string, role: 'admin' | 'user') => { success: boolean; message: string };
  updateUserRole: (username: string, role: 'admin' | 'user') => { success: boolean; message: string };
  deleteUser: (username: string) => { success: boolean; message: string };
  getAllUsers: () => User[];
  getUserPassword: (username: string) => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'مدير النظام', role: 'super_admin', createdAt: new Date().toISOString() },
  { id: '2', username: 'ابوابرهيم', role: 'user', createdAt: new Date().toISOString() },
];

const DEFAULT_CREDENTIALS: Record<string, string> = {
  'مدير النظام': '65814909',
  'ابوابرهيم': '12345678',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [credentials, setCredentials] = useState<Record<string, string>>(DEFAULT_CREDENTIALS);

  useEffect(() => {
    const savedUsers = localStorage.getItem('smartAccountant_users');
    const savedCredentials = localStorage.getItem('smartAccountant_credentials');
    const savedCurrentUser = localStorage.getItem('smartAccountant_currentUser');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedCredentials) setCredentials(JSON.parse(savedCredentials));
    if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));
  }, []);

  useEffect(() => {
    localStorage.setItem('smartAccountant_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('smartAccountant_credentials', JSON.stringify(credentials));
  }, [credentials]);

  const login = (username: string, password: string): boolean => {
    const user = users.find((u) => u.username === username);
    const storedPassword = credentials[username];

    if (user && storedPassword === password) {
      setCurrentUser(user);
      localStorage.setItem('smartAccountant_currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smartAccountant_currentUser');
  };

  const addUser = (username: string, password: string, role: 'admin' | 'user') => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, message: '❌ لا توجد صلاحيات كافية لإضافة مستخدمين' };
    }
    if (users.some((u) => u.username === username)) {
      return { success: false, message: '❌ اسم المستخدم موجود بالفعل' };
    }
    if (!username || !password) {
      return { success: false, message: '❌ يرجى ملء جميع الحقول' };
    }
    if (password.length < 6) {
      return { success: false, message: '❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
    }
    const newUser: User = {
      id: Date.now().toString(),
      username,
      role,
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    setCredentials({ ...credentials, [username]: password });
    return { success: true, message: `✅ تم إضافة المستخدم ${username} بنجاح` };
  };

  const updateUserRole = (username: string, role: 'admin' | 'user') => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, message: '❌ لا توجد صلاحيات كافية لتعديل الصلاحيات' };
    }
    if (username === 'مدير النظام') {
      return { success: false, message: '❌ لا يمكن تعديل صلاحيات مدير النظام' };
    }
    setUsers(users.map((u) => u.username === username ? { ...u, role } : u));
    if (currentUser.username === username) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem('smartAccountant_currentUser', JSON.stringify(updatedUser));
    }
    return { success: true, message: `✅ تم تحديث صلاحيات ${username}` };
  };

  const deleteUser = (username: string) => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      return { success: false, message: '❌ لا توجد صلاحيات كافية لحذف مستخدمين' };
    }
    if (username === 'مدير النظام') {
      return { success: false, message: '❌ لا يمكن حذف حساب مدير النظام' };
    }
    setUsers(users.filter((u) => u.username !== username));
    const newCredentials = { ...credentials };
    delete newCredentials[username];
    setCredentials(newCredentials);
    return { success: true, message: `✅ تم حذف المستخدم ${username}` };
  };

  const getAllUsers = (): User[] => users;
  const getUserPassword = (username: string): string | null => credentials[username] || null;

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn: !!currentUser,
      isSuperAdmin: currentUser?.role === 'super_admin',
      isAdmin: currentUser?.role === 'admin' || currentUser?.role === 'super_admin',
      login,
      logout,
      addUser,
      updateUserRole,
      deleteUser,
      getAllUsers,
      getUserPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
