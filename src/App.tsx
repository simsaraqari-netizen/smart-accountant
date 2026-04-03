import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  PlusCircle, 
  MinusCircle, 
  Wallet, 
  ReceiptText,
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  PieChart as PieChartIcon,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  LayoutDashboard,
  Coins,
  Menu,
  X,
  Download,
  Settings,
  Trash2,
  User as UserIcon,
  UserCircle,
  Eye,
  EyeOff,
  Filter,
  Printer,
  FileText,
  Users,
  ShieldCheck,
  UserPlus,
  Undo2,
  Redo2,
  AlertTriangle,
  SlidersHorizontal,
  Copy,
  Check,
  Edit2,
  Bell,
  Calendar,
  Clock,
  RefreshCw,
  Save
} from 'lucide-react';
import { MonthlyReport } from './components/MonthlyReport';
import { IncomeReport } from './components/IncomeReport';
import { 
  auth, 
  db 
} from './firebase';
import firebaseConfig from '../firebase-applet-config.json';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  getAuth
} from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  Timestamp,
  orderBy,
  limit,
  getDoc,
  increment
} from 'firebase/firestore';
import { 
  Transaction, 
  TransactionSplit,
  CustodyAccount, 
  TransactionType,
  Reminder,
  FirestoreErrorInfo
} from './types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { FormattedNumber } from './components/common/FormattedNumber';
import { CollapsibleSection } from './components/common/CollapsibleSection';
import { StatCard } from './components/common/StatCard';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { TransactionModal } from './components/modals/TransactionModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { UserManagementModal } from './components/modals/UserManagementModal';
import { PersonsModal } from './components/modals/PersonsModal';

// --- Error Handling ---
const handleFirestoreError = (error: unknown, operationType: FirestoreErrorInfo['operationType'], path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: (auth.currentUser as any)?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName || '',
        email: provider.email || '',
        photoUrl: provider.photoURL || ''
      })) || []
    },
    operationType,
    path
  };
  const errorString = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorString);
  throw new Error(errorString);
};

class ErrorBoundary extends React.Component<any, any> {
  public state: any;
  public props: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = 'حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.';
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = `خطأ في قاعدة البيانات: ${parsed.error}`;
      } catch (e) {
        if (this.state.error.message) errorMessage = this.state.error.message;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-right" dir="rtl">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">عذراً، حدث خطأ ما</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              إعادة تحميل التطبيق
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Components ---

const CustomMenuIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="11" x2="21" y2="11" />
    <line x1="3" y1="16" x2="21" y2="16" />
    <line x1="3" y1="21" x2="21" y2="21" />
  </svg>
);


export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [custodyAccounts, setCustodyAccounts] = useState<CustodyAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'custody'>('dashboard');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [showOnlyCustody, setShowOnlyCustody] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    month: '',
    startDate: '',
    endDate: '',
    personName: '',
    category: '',
    custodyAccountId: '',
    minAmount: '',
    maxAmount: ''
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [persons, setPersons] = useState<any[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddCustodyModal, setShowAddCustodyModal] = useState(false);
  const [editingCustody, setEditingCustody] = useState<CustodyAccount | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDueDate, setNewReminderDueDate] = useState('');
  const [newReminderIsRecurring, setNewReminderIsRecurring] = useState(false);
  const [newReminderFrequency, setNewReminderFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [vapidKey, setVapidKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [editTx, setEditTx] = useState<any>({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    custodyAccountId: '',
    custodyAmount: '',
    personName: '',
    splitType: 'individual',
    splits: [],
    isCustodyLinked: true,
    newCategoryName: '',
    newAccountName: '',
    newPersonName: '',
    isAddingNewCategory: false,
    isAddingNewAccount: false,
    isAddingNewPerson: false
  });
  const [newCustodyName, setNewCustodyName] = useState('');
  const [newCustodyBalance, setNewCustodyBalance] = useState<string>('0');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showPersonsModal, setShowPersonsModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user'
  });
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    username: '',
    password: ''
  });
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => Promise<void> | void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const generatePDFReport = async () => {
    setIsGeneratingPDF(true);
    const reportElement = document.getElementById('pdf-report-template');
    if (!reportElement) {
      setIsGeneratingPDF(false);
      return;
    }

    try {
      // Temporarily show the report for capturing
      reportElement.style.display = 'block';
      
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`تقرير_مالي_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      reportElement.style.display = 'none';
    } catch (error) {
      console.error('PDF Generation Error:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | 'loading' | null, message: string | null }>({ type: null, message: null });
  const [newTx, setNewTx] = useState({
    amount: '',
    type: 'expense' as TransactionType,
    category: '',
    description: '',
    custodyAccountId: '',
    custodyAmount: '',
    personName: '',
    splitType: 'individual' as 'individual' | 'joint',
    splits: [] as TransactionSplit[],
    isCustodyLinked: true,
    newCategoryName: '',
    newAccountName: '',
    newPersonName: '',
    isAddingNewCategory: false,
    isAddingNewAccount: false,
    isAddingNewPerson: false
  });
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountForm, setAccountForm] = useState({
    newPassword: '',
    confirmPassword: '',
    currentPassword: '' // Only needed if they already have a password
  });

  // Email Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Handle back button / gesture
  useEffect(() => {
    if (!user) return;

    // Push initial state
    if (window.history.state?.entry !== 1) {
      window.history.pushState({ entry: 1 }, '');
    }

    const handlePopState = () => {
      // If any modal is open, close it
      if (showAddModal || showAddCustodyModal || showSettingsModal || showAddCategoryModal || isDrawerOpen || confirmDialog.isOpen || showAccountModal || showUserManagementModal) {
        setShowAddModal(false);
        setShowAddCustodyModal(false);
        setShowSettingsModal(false);
        setShowAddCategoryModal(false);
        setIsDrawerOpen(false);
        setShowAccountModal(false);
        setShowUserManagementModal(false);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        window.history.pushState({ entry: 1 }, '');
        return;
      }

      // If not on dashboard, go back to dashboard
      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        window.history.pushState({ entry: 1 }, '');
        return;
      }

      // If on dashboard, do nothing or let default behavior happen
      // Since we want to cancel exit, we just push state again to stay on app
      window.history.pushState({ entry: 1 }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, activeTab, showAddModal, showAddCustodyModal, showSettingsModal, showAddCategoryModal, isDrawerOpen, confirmDialog.isOpen, showAccountModal]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // Fetch user role
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserRole(data.role);
          setTenantId(data.tenantId || u.uid);
        } else {
          // If user document doesn't exist, create it as 'admin' of their own tenant
          const role = 'admin';
          await setDoc(doc(db, 'users', u.uid), {
            email: u.email,
            displayName: u.displayName || '',
            role: role,
            tenantId: u.uid,
            createdAt: Timestamp.now()
          });
          setUserRole(role);
          setTenantId(u.uid);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setTenantId(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const requestToken = async () => {
      if (user && vapidKey && 'serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          const messaging = getMessaging();
          
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }

          if (Notification.permission === 'granted') {
            const token = await getToken(messaging, { 
              serviceWorkerRegistration: registration,
              vapidKey: vapidKey
            });
            
            if (token) {
              console.log('FCM Token retrieved:', token);
              const userRef = doc(db, 'users', user.uid);
              const userSnap = await getDoc(userRef);
              const currentTokens = userSnap.data()?.fcmTokens || [];
              if (!currentTokens.includes(token)) {
                await updateDoc(userRef, {
                  fcmTokens: [...currentTokens, token]
                });
              }
            }
          }
        } catch (err) {
          console.error('An error occurred while retrieving token. ', err);
        }
      }
    };
    requestToken();
  }, [user, vapidKey]);

  useEffect(() => {
    if (user && tenantId) {
      const unsub = onSnapshot(doc(db, 'settings', tenantId), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const url = data.sheetUrl || '';
          setSheetUrl(url);
          setNotificationsEnabled(data.notificationsEnabled || false);
          setVapidKey(data.vapidKey || '');
          
          // Auto-set if empty and user is admin
          if (!url && userRole === 'admin') {
             setDoc(doc(db, 'settings', tenantId), { 
               sheetUrl: 'https://script.google.com/macros/s/AKfycbx9mEzkMvhDvE7CSedxvWHAtx5h76ET6z9rtTvRKZaEfPQfxoDvilwtS8yU9AqnGT3k/exec' 
             }, { merge: true });
          }
        } else if (userRole === 'admin') {
           // Create settings doc if it doesn't exist
           setDoc(doc(db, 'settings', tenantId), { 
             sheetUrl: 'https://script.google.com/macros/s/AKfycbx9mEzkMvhDvE7CSedxvWHAtx5h76ET6z9rtTvRKZaEfPQfxoDvilwtS8yU9AqnGT3k/exec',
             notificationsEnabled: false
           }, { merge: true });
        }
      });
      return () => unsub();
    } else {
      setSheetUrl('');
    }
  }, [user, userRole, tenantId]);

  useEffect(() => {
    if (user && tenantId) {
      const q = query(collection(db, 'reminders'), where('userId', '==', user.uid));
      const unsub = onSnapshot(q, (snapshot) => {
        const reminderList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Reminder[];
        setReminders(reminderList);
      }, (error) => {
        handleFirestoreError(error, 'list', 'reminders');
      });
      return unsub;
    }
  }, [user, tenantId]);

  const handleAddReminder = async () => {
    if (!user || !tenantId || !newReminderTitle || !newReminderDueDate) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const reminderData: Omit<Reminder, 'id'> = {
        title: newReminderTitle,
        dueDate: Timestamp.fromDate(new Date(newReminderDueDate)),
        isRecurring: newReminderIsRecurring,
        frequency: newReminderIsRecurring ? newReminderFrequency : undefined,
        userId: user.uid,
        enabled: true,
        tenantId: tenantId
      };

      await addDoc(collection(db, 'reminders'), reminderData);
      setNewReminderTitle('');
      setNewReminderDueDate('');
      setNewReminderIsRecurring(false);
      setNewReminderFrequency('monthly');
      alert('تم إضافة التذكير بنجاح');
    } catch (err) {
      console.error('Error adding reminder:', err);
      alert('فشل إضافة التذكير. تأكد من اتصالك بالانترنت.');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التذكير؟')) {
      try {
        await deleteDoc(doc(db, 'reminders', id));
      } catch (err) {
        console.error('Error deleting reminder:', err);
        alert('فشل حذف التذكير.');
      }
    }
  };

  const toggleReminderEnabled = async (reminder: Reminder) => {
    try {
      await updateDoc(doc(db, 'reminders', reminder.id), {
        enabled: !reminder.enabled
      });
    } catch (err) {
      console.error('Error toggling reminder:', err);
      alert('فشل تحديث التذكير.');
    }
  };

  const [isSeeding, setIsSeeding] = useState(false);
  const [historyState, setHistoryState] = useState<{
    history: any[];
    pointer: number;
  }>({
    history: [],
    pointer: -1
  });

  useEffect(() => {
    if (tenantId) {
      const saved = localStorage.getItem(`txHistory_${tenantId}`);
      const savedPointer = localStorage.getItem(`txHistoryPointer_${tenantId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const loadedHistory = parsed.map((action: any) => {
            if (action.data && action.data.date && action.data.date.seconds) {
              action.data.date = new Timestamp(action.data.date.seconds, action.data.date.nanoseconds);
            }
            if (action.oldData && action.oldData.date && action.oldData.date.seconds) {
              action.oldData.date = new Timestamp(action.oldData.date.seconds, action.oldData.date.nanoseconds);
            }
            return action;
          });
          setHistoryState({
            history: loadedHistory,
            pointer: savedPointer ? parseInt(savedPointer, 10) : -1
          });
        } catch (e) {
          setHistoryState({ history: [], pointer: -1 });
        }
      } else {
        setHistoryState({ history: [], pointer: -1 });
      }
    } else {
      setHistoryState({ history: [], pointer: -1 });
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(`txHistory_${tenantId}`, JSON.stringify(historyState.history));
          localStorage.setItem(`txHistoryPointer_${tenantId}`, historyState.pointer.toString());
        } catch (e) {
          if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            // If quota exceeded, keep only the last 50 items
            const trimmedHistory = historyState.history.slice(-50);
            const newPointer = Math.min(historyState.pointer, trimmedHistory.length - 1);
            setHistoryState({
              history: trimmedHistory,
              pointer: newPointer
            });
            try {
              localStorage.setItem(`txHistory_${tenantId}`, JSON.stringify(trimmedHistory));
              localStorage.setItem(`txHistoryPointer_${tenantId}`, newPointer.toString());
            } catch (e2) {
              console.error('Failed to save history even after trimming', e2);
            }
          }
        }
      }, 1000); // Debounce history saving
      return () => clearTimeout(timer);
    }
  }, [historyState, tenantId]);

  const pushToHistory = (action: any) => {
    setHistoryState(prev => {
      const newHistory = prev.history.slice(0, prev.pointer + 1);
      newHistory.push(action);
      return {
        history: newHistory,
        pointer: newHistory.length - 1
      };
    });
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUndo = async () => {
    if (historyState.pointer < 0 || userRole !== 'admin') return;

    setConfirmDialog({
      isOpen: true,
      message: 'هل أنت متأكد من التراجع عن العملية السابقة؟',
      onConfirm: async () => {
        const action = historyState.history[historyState.pointer];
        setHistoryState(prev => ({ ...prev, pointer: prev.pointer - 1 }));

        try {
          if (action.type === 'ADD') {
            if (action.collection === 'transactions') {
              // Undo Add Transaction
              if (action.data.custodyAccountId) {
                const accountRef = doc(db, 'custody_accounts', action.data.custodyAccountId);
                const isPositive = action.data.type === 'income' || action.data.type === 'custody_in';
                const balanceChange = isPositive ? -action.data.amount : action.data.amount;
                await updateDoc(accountRef, { balance: increment(balanceChange) });
              }
            }
            await deleteDoc(doc(db, action.collection, action.id));
            showToast('تم التراجع عن الإضافة', 'info');
          } else if (action.type === 'DELETE') {
            if (action.collection === 'transactions') {
              // Undo Delete Transaction
              if (action.data.custodyAccountId) {
                const accountRef = doc(db, 'custody_accounts', action.data.custodyAccountId);
                const isPositive = action.data.type === 'income' || action.data.type === 'custody_in';
                const balanceChange = isPositive ? action.data.amount : -action.data.amount;
                await updateDoc(accountRef, { balance: increment(balanceChange) });
              }
            }
            await setDoc(doc(db, action.collection, action.id), action.data);
            showToast('تم التراجع عن الحذف', 'info');
          } else if (action.type === 'UPDATE') {
            if (action.collection === 'transactions') {
              // Undo Update Transaction
              // Reverse new transaction impact
              if (action.data.custodyAccountId && action.data.isCustodyLinked) {
                const newAccountRef = doc(db, 'custody_accounts', action.data.custodyAccountId);
                const newIsPositive = action.data.type === 'income' || action.data.type === 'custody_in';
                const newBalanceChange = newIsPositive ? -(action.data.custodyAmount || 0) : (action.data.custodyAmount || 0);
                await updateDoc(newAccountRef, { balance: increment(newBalanceChange) });
              }

              // Apply old transaction impact
              if (action.oldData.custodyAccountId && action.oldData.isCustodyLinked) {
                const oldAccountRef = doc(db, 'custody_accounts', action.oldData.custodyAccountId);
                const oldIsPositive = action.oldData.type === 'income' || action.oldData.type === 'custody_in';
                const oldBalanceChange = oldIsPositive ? (action.oldData.custodyAmount || 0) : -(action.oldData.custodyAmount || 0);
                await updateDoc(oldAccountRef, { balance: increment(oldBalanceChange) });
              }
            }
            await updateDoc(doc(db, action.collection, action.id), action.oldData);
            showToast('تم التراجع عن التعديل', 'info');
          }
        } catch (error) {
          console.error('Undo error:', error);
          showToast('فشل التراجع', 'error');
        }
      }
    });
  };

  const handleRedo = async () => {
    if (historyState.pointer >= historyState.history.length - 1 || userRole !== 'admin') return;

    setConfirmDialog({
      isOpen: true,
      message: 'هل أنت متأكد من إعادة تنفيذ العملية؟',
      onConfirm: async () => {
        const nextPointer = historyState.pointer + 1;
        const action = historyState.history[nextPointer];
        setHistoryState(prev => ({ ...prev, pointer: nextPointer }));

        try {
          if (action.type === 'ADD') {
            if (action.collection === 'transactions') {
              // Redo Add Transaction
              if (action.data.custodyAccountId) {
                const accountRef = doc(db, 'custody_accounts', action.data.custodyAccountId);
                const isPositive = action.data.type === 'income' || action.data.type === 'custody_in';
                const balanceChange = isPositive ? action.data.amount : -action.data.amount;
                await updateDoc(accountRef, { balance: increment(balanceChange) });
              }
            }
            await setDoc(doc(db, action.collection, action.id), action.data);
            showToast('تمت اعادة الاضافة', 'info');
          } else if (action.type === 'DELETE') {
            if (action.collection === 'transactions') {
              // Redo Delete Transaction
              if (action.data.custodyAccountId) {
                const accountRef = doc(db, 'custody_accounts', action.data.custodyAccountId);
                const isPositive = action.data.type === 'income' || action.data.type === 'custody_in';
                const balanceChange = isPositive ? -action.data.amount : action.data.amount;
                await updateDoc(accountRef, { balance: increment(balanceChange) });
              }
            }
            await deleteDoc(doc(db, action.collection, action.id));
            showToast('تمت اعادة الحذف', 'info');
          } else if (action.type === 'UPDATE') {
            if (action.collection === 'transactions') {
              // Redo Update Transaction
              // Reverse old transaction impact
              if (action.oldData.custodyAccountId && action.oldData.isCustodyLinked) {
                const oldAccountRef = doc(db, 'custody_accounts', action.oldData.custodyAccountId);
                const oldIsPositive = action.oldData.type === 'income' || action.oldData.type === 'custody_in';
                const oldBalanceChange = oldIsPositive ? -(action.oldData.custodyAmount || 0) : (action.oldData.custodyAmount || 0);
                await updateDoc(oldAccountRef, { balance: increment(oldBalanceChange) });
              }

              // Apply new transaction impact
              if (action.data.custodyAccountId && action.data.isCustodyLinked) {
                const newAccountRef = doc(db, 'custody_accounts', action.data.custodyAccountId);
                const newIsPositive = action.data.type === 'income' || action.data.type === 'custody_in';
                const newBalanceChange = newIsPositive ? (action.data.custodyAmount || 0) : -(action.data.custodyAmount || 0);
                await updateDoc(newAccountRef, { balance: increment(newBalanceChange) });
              }
            }
            await updateDoc(doc(db, action.collection, action.id), action.data);
            showToast('تمت اعادة التعديل', 'info');
          }
        } catch (error) {
          console.error('Redo error:', error);
          showToast('فشلت الاعادة', 'error');
        }
      }
    });
  };
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;
    
    if (newUserForm.password.length < 6) {
      setFormStatus({ type: 'error', message: 'كلمة المرور يجب ان تكون 6 خانات على الاقل' });
      return;
    }
    
    setFormStatus({ type: 'loading', message: 'جاري انشاء المستخدم...' });
    try {
      // To create a user without signing out the current admin, 
      // we initialize a secondary firebase app instance.
      const secondaryApp = getApps().find(app => app.name === 'SecondaryApp') || initializeApp(firebaseConfig, 'SecondaryApp');
      const secondaryAuth = getAuth(secondaryApp);
      
      const authEmail = formatAuthEmail(newUserForm.email);
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        authEmail, 
        newUserForm.password
      );
      
      const newUid = userCredential.user.uid;
      
      // Add to Firestore users collection
      const userData = {
        email: authEmail,
        username: newUserForm.email, // Store the original input as username
        displayName: newUserForm.email,
        role: newUserForm.role,
        tenantId: tenantId,
        createdAt: Timestamp.now()
      };
      await setDoc(doc(db, 'users', newUid), userData);
      
      pushToHistory({
        type: 'ADD',
        collection: 'users',
        id: newUid,
        data: userData
      });
      
      // Sign out from secondary app to clean up
      await secondaryAuth.signOut();
      
      setNewUserForm({ email: '', password: '', role: 'user' });
      setFormStatus({ type: 'success', message: 'تم انشاء المستخدم بنجاح' });
    } catch (error: any) {
      console.error('Create User Error:', error);
      let message = 'حدث خطأ اثناء انشاء المستخدم';
      if (error.code === 'auth/email-already-in-use') message = 'هذا البريد الالكتروني مستخدم بالفعل';
      if (error.code === 'auth/weak-password') message = 'كلمة المرور ضعيفة جداً (يجب ان تكون 6 خانات على الاقل)';
      if (error.code === 'auth/invalid-email') message = 'البريد الالكتروني او اسم المستخدم غير صالح';
      if (error.code === 'auth/operation-not-allowed') message = 'تسجيل الدخول بالبريد الالكتروني غير مفعل في Firebase';
      setFormStatus({ type: 'error', message });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userRole !== 'admin' || userId === user?.uid) return;
    
    setConfirmDialog({
      isOpen: true,
      message: 'هل انت متأكد من حذف هذا المستخدم؟ سيتم حذفه من قاعدة البيانات فقط (لا يمكن حذف حسابات الدخول آلياً من هنا لاسباب امنية).',
      onConfirm: async () => {
        try {
          const userToDelete = allUsers.find(u => u.id === userId);
          if (userToDelete) {
            const { id: _id, ...userData } = userToDelete;
            pushToHistory({
              type: 'DELETE',
              collection: 'users',
              id: userId,
              data: userData
            });
          }
          await deleteDoc(doc(db, 'users', userId));
        } catch (error) {
          console.error('Delete User Error:', error);
          handleFirestoreError(error, 'delete', 'users');
        }
      }
    });
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    if (userRole !== 'admin' || userId === user?.uid) return;
    try {
      const userToUpdate = allUsers.find(u => u.id === userId);
      if (userToUpdate) {
        const { id: _id, ...oldData } = userToUpdate;
        const newData = { ...oldData, role: newRole };
        pushToHistory({
          type: 'UPDATE',
          collection: 'users',
          id: userId,
          data: newData,
          oldData: oldData
        });
      }
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (error) {
      console.error('Update Role Error:', error);
      handleFirestoreError(error, 'update', 'users');
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin' || !editingUser) return;
    
    setFormStatus({ type: 'loading', message: 'جاري تحديث بيانات المستخدم...' });
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: editingUser.id,
          newUsername: editUserForm.username,
          newPassword: editUserForm.password,
          adminToken: token
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل تحديث المستخدم');
      }

      setFormStatus({ type: 'success', message: 'تم تحديث بيانات المستخدم بنجاح' });
      setEditingUser(null);
      setEditUserForm({ username: '', password: '' });
    } catch (error: any) {
      console.error('Edit User Error:', error);
      setFormStatus({ type: 'error', message: error.message });
    }
  };

  useEffect(() => {
    if (user && tenantId) {
      const q = query(collection(db, 'categories'), where('userId', '==', tenantId));
      const unsub = onSnapshot(q, (snapshot) => {
        const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (cats.length === 0 && !isSeeding && userRole === 'admin') {
          setIsSeeding(true);
          // Seed initial categories
          const initialCats = [
            { name: 'راتب', type: 'income', userId: tenantId },
            { name: 'مبيعات', type: 'income', userId: tenantId },
            { name: 'استثمار', type: 'income', userId: tenantId },
            { name: 'أخرى', type: 'income', userId: tenantId },
            { name: 'إيجار', type: 'expense', userId: tenantId },
            { name: 'فواتير', type: 'expense', userId: tenantId },
            { name: 'طعام', type: 'expense', userId: tenantId },
            { name: 'مواصلات', type: 'expense', userId: tenantId },
            { name: 'أخرى', type: 'expense', userId: tenantId },
          ];
          
          const seed = async () => {
            try {
              for (const cat of initialCats) {
                await addDoc(collection(db, 'categories'), cat);
              }
            } catch (err) {
              console.error('Seeding Error:', err);
              handleFirestoreError(err, 'create', 'categories');
            }
          };
          seed();
        } else {
          setCategories(cats);
        }
      }, (err) => handleFirestoreError(err, 'list', 'categories'));
      return () => unsub();
    } else {
      setCategories([]);
    }
  }, [user, isSeeding, userRole]);

  const syncToSheets = async (data: any[]) => {
    if (userRole !== 'admin') return;
    if (!sheetUrl || isSyncing) return;
    try {
      setIsSyncing(true);
      const formattedData = data.map(tx => {
        const custodyAccount = custodyAccounts.find(acc => acc.id === tx.custodyAccountId);
        return {
          id: tx.id,
          date: tx.date instanceof Timestamp ? tx.date.toDate().toISOString() : tx.date.toISOString(),
          category: tx.category,
          type: tx.type,
          amount: tx.amount,
          description: tx.description || '',
          personName: tx.personName || '',
          isCustodyLinked: tx.isCustodyLinked || false,
          custodyAccountId: tx.custodyAccountId || '',
          custodyAccountName: custodyAccount ? custodyAccount.name : '',
          custodyAmount: tx.custodyAmount || 0
        };
      });

      // Use a simple POST to a Google Apps Script Web App
      const response = await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(formattedData)
      });
      return true;
    } catch (error) {
      console.error('Error syncing to sheets:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSyncToSheets = async () => {
    if (userRole !== 'admin') return;
    if (!sheetUrl) {
      alert('يرجى ضبط رابط المزامنة في الإعدادات أولاً');
      return;
    }
    const success = await syncToSheets(transactions);
    if (success) {
      alert('تم إرسال البيانات إلى Google Sheets بنجاح');
    } else {
      alert('فشلت المزامنة. تأكد من إعداد الرابط بشكل صحيح.');
    }
  };

  const syncFromSheets = async () => {
    if (userRole !== 'admin') return;
    if (!sheetUrl) {
      alert('يرجى ضبط رابط المزامنة في الإعدادات أولاً');
      return;
    }
    try {
      setIsSyncing(true);
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('البيانات المستلمة ليست بتنسيق جدول صحيح');
      }

      if (data.length <= 1) {
        alert('الجدول فارغ او يحتوي على العناوين فقط. قم باضافة بيانات او تصدير بيانات من التطبيق أولاً.');
        return;
      }

      const rows = data.slice(1);
      let successCount = 0;
      
      for (const row of rows) {
        const [id, date, category, type, amount, description, personName, isCustodyLinked, custodyAccountId, custodyAccountName, custodyAmount] = row;
        if (!date) continue;
        
        try {
          const parsedDate = new Date(date);
          if (isNaN(parsedDate.getTime())) continue;

          // Try to find custody account ID by name if ID is missing but name is present
          let finalCustodyAccountId = custodyAccountId;
          if (!finalCustodyAccountId && custodyAccountName) {
            const acc = custodyAccounts.find(a => a.name === custodyAccountName);
            if (acc) finalCustodyAccountId = acc.id;
          }

          const txData: any = {
            date: Timestamp.fromDate(parsedDate),
            category: String(category || 'اخرى'),
            type: String(type || 'expense'),
            amount: Number(amount) || 0,
            description: String(description || ''),
            personName: String(personName || ''),
            isCustodyLinked: String(isCustodyLinked).toLowerCase() === 'true' || isCustodyLinked === true,
            custodyAmount: Number(custodyAmount) || 0,
            userId: tenantId
          };

          if (finalCustodyAccountId) {
            txData.custodyAccountId = finalCustodyAccountId;
          }

          if (id) {
            await setDoc(doc(db, 'transactions', id), txData);
          } else {
            // If no ID is provided (manual entry in sheet), create a new doc
            await addDoc(collection(db, 'transactions'), txData);
          }
          successCount++;
        } catch (e) {
          console.warn('Skipping invalid row:', row, e);
        }
      }
      
      if (successCount > 0) {
        alert(`تمت مزامنة ${successCount} عملية بنجاح من الجدول`);
      } else {
        alert('لم يتم العثور على بيانات صالحة للمزامنة في الجدول.');
      }
    } catch (error) {
      console.error('Error syncing from sheets:', error);
      alert('فشلت المزامنة. تأكد من:\n1. أن الرابط صحيح وينتهي بـ /exec\n2. أنك قمت بنشر الكود (Deploy) كـ Web App\n3. أن الوصول (Who has access) مضبوط على Anyone\n4. وجود اتصال بالإنترنت.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Remove automatic sync to avoid "Rate exceeded" errors from Google Sheets / Apps Script
  // Users should use the manual sync button in settings instead.
  /*
  useEffect(() => {
    if (user && sheetUrl && transactions.length > 0) {
      const timer = setTimeout(() => {
        syncToSheets(transactions);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [transactions, sheetUrl]);
  */
  useEffect(() => {
    if (!user || !tenantId) {
      setTransactions([]);
      setCustodyAccounts([]);
      setPersons([]);
      setAllUsers([]);
      setCategories([]);
      return;
    }

    const txQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', tenantId),
      orderBy('date', 'desc')
    );

    const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(docs);
    }, (err) => {
      handleFirestoreError(err, 'list', 'transactions');
      setFormStatus({ type: 'error', message: 'فشل في تحميل العمليات. تأكد من اتصالك بالانترنت.' });
    });

    const custodyQuery = query(
      collection(db, 'custody_accounts'),
      where('userId', '==', tenantId)
    );

    const unsubscribeCustody = onSnapshot(custodyQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustodyAccount));
      setCustodyAccounts(docs);
    }, (err) => handleFirestoreError(err, 'list', 'custody_accounts'));

    const personsQuery = query(
      collection(db, 'persons'),
      where('userId', '==', tenantId)
    );

    const unsubscribePersons = onSnapshot(personsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPersons(docs);
    }, (err) => handleFirestoreError(err, 'list', 'persons'));

    let unsubscribeUsers = () => {};
    if (userRole === 'admin') {
      const usersQuery = query(collection(db, 'users'), where('tenantId', '==', tenantId));
      unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllUsers(docs);
      }, (err) => handleFirestoreError(err, 'list', 'users'));
    }

    return () => {
      unsubscribeTx();
      unsubscribeCustody();
      unsubscribePersons();
      unsubscribeUsers();
    };
  }, [user, userRole, tenantId]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const formatAuthEmail = (input: string) => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed.includes('@')) return trimmed;
    return `${trimmed}@internal.app`;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    const authEmail = formatAuthEmail(email);

    try {
      // Try to sign in first
      try {
        await signInWithEmailAndPassword(auth, authEmail, password);
      } catch (signInError: any) {
        // If user not found, try to sign up automatically
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, authEmail, password);
          } catch (signUpError: any) {
            // If signup fails because user already exists (race condition), throw original signin error
            if (signUpError.code === 'auth/email-already-in-use') {
              throw signInError;
            }
            throw signUpError;
          }
        } else {
          throw signInError;
        }
      }
    } catch (error: any) {
      console.error('Auth Error:', error.code, error.message);
      let message = `خطأ (${error.code}): `;
      
      switch (error.code) {
        case 'auth/wrong-password':
          message += 'كلمة المرور غير صحيحة لهذا المستخدم';
          break;
        case 'auth/email-already-in-use':
          message += 'هذا المستخدم مسجل بالفعل بكلمة مرور مختلفة';
          break;
        case 'auth/weak-password':
          message += 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)';
          break;
        case 'auth/operation-not-allowed':
          message += 'تسجيل الدخول بالبريد معطل في إعدادات Firebase';
          break;
        case 'auth/invalid-credential':
          message += 'بيانات الدخول غير صحيحة';
          break;
        default:
          message += 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
      }
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setAuthError('يرجى ادخال البريد الالكتروني أولاً');
      setAuthSuccess(null);
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setAuthSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    } catch (error: any) {
      console.error('Reset Password Error:', error);
      let message = 'حدث خطأ أثناء إرسال رابط إعادة التعيين';
      if (error.code === 'auth/user-not-found') {
        message = 'هذا البريد الإلكتروني غير مسجل';
      } else if (error.code === 'auth/invalid-email') {
        message = 'صيغة البريد الإلكتروني غير صحيحة';
      }
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (accountForm.newPassword !== accountForm.confirmPassword) {
      alert('كلمات المرور غير متطابقة');
      return;
    }

    try {
      setFormStatus({ type: 'loading', message: 'جاري تحديث كلمة المرور...' });
      
      // Check if user needs re-authentication (common for password updates)
      // If they signed in with password, they need current password
      const isPasswordUser = user.providerData.some(p => p.providerId === 'password');
      
      if (isPasswordUser && accountForm.currentPassword) {
        const credential = EmailAuthProvider.credential(user.email!, accountForm.currentPassword);
        await reauthenticateWithCredential(user, credential);
      }

      await updatePassword(user, accountForm.newPassword);
      setFormStatus({ type: 'success', message: 'تم تحديث كلمة المرور بنجاح' });
      setAccountForm({ newPassword: '', confirmPassword: '', currentPassword: '' });
      setTimeout(() => {
        setShowAccountModal(false);
        setFormStatus({ type: null, message: null });
      }, 2000);
    } catch (error: any) {
      console.error('Update Password Error:', error);
      let message = 'حدث خطأ أثناء تحديث كلمة المرور';
      if (error.code === 'auth/wrong-password') message = 'كلمة المرور الحالية غير صحيحة';
      if (error.code === 'auth/requires-recent-login') message = 'يرجى تسجيل الخروج والدخول مرة أخرى لتنفيذ هذا الإجراء الحساس';
      if (error.code === 'auth/weak-password') message = 'كلمة المرور الجديدة ضعيفة جداً';
      
      setFormStatus({ type: 'error', message });
    }
  };

  const handleSignOut = () => signOut(auth);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newCategory.name || userRole !== 'admin') return;
    try {
      const categoryData = {
        ...newCategory,
        userId: tenantId
      };
      const docRef = await addDoc(collection(db, 'categories'), categoryData);
      
      pushToHistory({
        type: 'ADD',
        collection: 'categories',
        id: docRef.id,
        data: categoryData
      });
      
      setNewCategory({ name: '', type: 'expense' });
      // Removed automatic closing to allow adding multiple categories
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  useEffect(() => {
    if (editingTransaction) {
      setEditTx({
        amount: editingTransaction.amount.toString(),
        type: editingTransaction.type,
        category: editingTransaction.category,
        description: editingTransaction.description || '',
        custodyAccountId: editingTransaction.custodyAccountId || '',
        custodyAmount: (editingTransaction.custodyAmount || 0).toString(),
        personName: editingTransaction.personName || '',
        splitType: editingTransaction.splits && editingTransaction.splits.length > 0 ? 'joint' : 'individual',
        splits: editingTransaction.splits || [],
        isCustodyLinked: editingTransaction.isCustodyLinked || false,
        newCategoryName: '',
        newAccountName: '',
        newPersonName: '',
        isAddingNewCategory: false,
        isAddingNewAccount: false,
        isAddingNewPerson: false
      });
    }
  }, [editingTransaction]);

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingTransaction || !editTx.amount || (!editTx.category && !editTx.newCategoryName) || userRole !== 'admin') {
      setFormStatus({ type: 'error', message: 'يرجى ملء جميع الحقول المطلوبة (المبلغ والفئة).' });
      return;
    }

    setFormStatus({ type: 'loading', message: 'جاري التحديث...' });

    try {
      let finalCategory = editTx.category;
      let finalCustodyAccountId = editTx.custodyAccountId;
      let finalPersonName = editTx.splitType === 'individual' 
        ? (editTx.isAddingNewPerson ? editTx.newPersonName : editTx.personName)
        : '';
      let finalSplits = editTx.splitType === 'joint' 
        ? (editTx.splits || []).filter((s: any) => s.personName && s.amount > 0)
        : [];

      // Validation for joint transactions
      if (editTx.splitType === 'joint') {
        if (finalSplits.length === 0) {
          setFormStatus({ type: 'error', message: 'يرجى إضافة شخص واحد على الأقل للتقسيم.' });
          return;
        }
        const splitTotal = finalSplits.reduce((sum: number, s: any) => sum + s.amount, 0);
        const totalAmount = parseFloat(editTx.amount);
        if (Math.abs(splitTotal - totalAmount) > 0.01) {
          setFormStatus({ type: 'error', message: 'إجمالي مبالغ التقسيم يجب أن يساوي مبلغ العملية.' });
          return;
        }
      }

      // 1. Handle New Category
      if (editTx.isAddingNewCategory && editTx.newCategoryName) {
        const categoryData = {
          name: editTx.newCategoryName,
          type: editTx.type === 'income' ? 'income' : 'expense',
          userId: tenantId
        };
        const catRef = await addDoc(collection(db, 'categories'), categoryData);
        
        pushToHistory({
          type: 'ADD',
          collection: 'categories',
          id: catRef.id,
          data: categoryData
        });
        
        finalCategory = editTx.newCategoryName;
      }

      // 2. Handle New Custody Account
      if (editTx.isCustodyLinked && editTx.isAddingNewAccount && editTx.newAccountName) {
        const accountData = {
          name: editTx.newAccountName,
          balance: 0,
          userId: tenantId
        };
        const accRef = await addDoc(collection(db, 'custody_accounts'), accountData);
        
        pushToHistory({
          type: 'ADD',
          collection: 'custody_accounts',
          id: accRef.id,
          data: accountData
        });
        
        finalCustodyAccountId = accRef.id;
      }

      // 3. Handle New People (Main and Splits)
      const allPeopleNames = new Set<string>();
      if (finalPersonName) allPeopleNames.add(finalPersonName);
      finalSplits.forEach((s: any) => {
        if (s.personName) allPeopleNames.add(s.personName);
      });

      for (const pName of Array.from(allPeopleNames)) {
        const personExists = persons.some(p => p.name.toLowerCase() === pName.toLowerCase());
        if (!personExists) {
          const personData = {
            name: pName,
            userId: tenantId,
            createdAt: Timestamp.now()
          };
          const personRef = await addDoc(collection(db, 'persons'), personData);
          
          pushToHistory({
            type: 'ADD',
            collection: 'persons',
            id: personRef.id,
            data: personData
          });
        }
      }

      const newAmount = parseFloat(editTx.amount);
      const newCustodyAmount = parseFloat(editTx.custodyAmount) || 0;

      if (isNaN(newAmount) || newAmount <= 0) {
        setFormStatus({ type: 'error', message: 'يرجى إدخال مبلغ صالح (أكبر من الصفر).' });
        return;
      }

      if (editTx.isCustodyLinked && isNaN(newCustodyAmount)) {
        setFormStatus({ type: 'error', message: 'يرجى إدخال مبلغ عهدة صالح.' });
        return;
      }
      
      const updatedData: any = {
        amount: newAmount,
        type: editTx.type,
        category: finalCategory,
        description: editTx.description || '',
        personName: finalPersonName || '',
        isCustodyLinked: editTx.isCustodyLinked || false,
        custodyAmount: newCustodyAmount,
        splits: finalSplits,
        splitType: editTx.splitType
      };

      if (finalCustodyAccountId) {
        updatedData.custodyAccountId = finalCustodyAccountId;
      } else {
        updatedData.custodyAccountId = null;
      }

      // 4. Update Custody Balances
      // Reverse old transaction impact
      if (editingTransaction.custodyAccountId && editingTransaction.isCustodyLinked) {
        const oldAccountRef = doc(db, 'custody_accounts', editingTransaction.custodyAccountId);
        const oldIsPositive = editingTransaction.type === 'income' || editingTransaction.type === 'custody_in';
        const oldBalanceChange = oldIsPositive ? -(editingTransaction.custodyAmount || 0) : (editingTransaction.custodyAmount || 0);
        await updateDoc(oldAccountRef, { balance: increment(oldBalanceChange) });
      }

      // Apply new transaction impact
      if (finalCustodyAccountId && editTx.isCustodyLinked) {
        const newAccountRef = doc(db, 'custody_accounts', finalCustodyAccountId);
        const newIsPositive = editTx.type === 'income' || editTx.type === 'custody_in';
        const newBalanceChange = newIsPositive ? newCustodyAmount : -newCustodyAmount;
        await updateDoc(newAccountRef, { balance: increment(newBalanceChange) });
      }

      // 5. Update the transaction
      await updateDoc(doc(db, 'transactions', editingTransaction.id), updatedData);
      
      // Push to history
      const { id: _id, ...oldDataWithoutId } = editingTransaction;
      pushToHistory({
        type: 'UPDATE',
        collection: 'transactions',
        id: editingTransaction.id,
        data: updatedData,
        oldData: oldDataWithoutId
      });
      
      setFormStatus({ type: 'success', message: 'تم تحديث العملية بنجاح!' });
      setTimeout(() => {
        setShowEditModal(false);
        setEditingTransaction(null);
        setFormStatus({ type: null, message: null });
        setActiveTab('dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Update Transaction Error:', error);
      handleFirestoreError(error, 'update', 'transactions');
      setFormStatus({ type: 'error', message: `خطأ أثناء التحديث: ${error.message}` });
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTx.amount || (!newTx.category && !newTx.newCategoryName) || userRole !== 'admin') {
      setFormStatus({ type: 'error', message: 'يرجى ملء جميع الحقول المطلوبة (المبلغ والفئة).' });
      return;
    }

    if (newTx.isCustodyLinked && !newTx.custodyAccountId && !newTx.newAccountName) {
      setFormStatus({ type: 'error', message: 'يرجى اختيار أو إضافة حساب العهدة لهذه العملية.' });
      return;
    }

    setFormStatus({ type: 'loading', message: 'جاري الحفظ...' });

    try {
      let finalCategory = newTx.category;
      let finalCustodyAccountId = newTx.custodyAccountId;
      let finalPersonName = newTx.splitType === 'individual' 
        ? (newTx.isAddingNewPerson ? newTx.newPersonName : newTx.personName)
        : '';
      let finalSplits = newTx.splitType === 'joint' 
        ? newTx.splits.filter(s => s.personName && s.amount > 0)
        : [];

      // Validation for joint transactions
      if (newTx.splitType === 'joint') {
        if (finalSplits.length === 0) {
          setFormStatus({ type: 'error', message: 'يرجى إضافة شخص واحد على الأقل للتقسيم.' });
          return;
        }
        const splitTotal = finalSplits.reduce((sum, s) => sum + s.amount, 0);
        const totalAmount = parseFloat(newTx.amount);
        if (Math.abs(splitTotal - totalAmount) > 0.01) {
          setFormStatus({ type: 'error', message: 'إجمالي مبالغ التقسيم يجب أن يساوي مبلغ العملية.' });
          return;
        }
      }

      // 1. Handle New Category
      if (newTx.isAddingNewCategory && newTx.newCategoryName) {
        const categoryData = {
          name: newTx.newCategoryName,
          type: newTx.type === 'income' ? 'income' : 'expense',
          userId: tenantId
        };
        const catRef = await addDoc(collection(db, 'categories'), categoryData);
        
        pushToHistory({
          type: 'ADD',
          collection: 'categories',
          id: catRef.id,
          data: categoryData
        });
        
        finalCategory = newTx.newCategoryName;
      }

      // 2. Handle New Custody Account
      if (newTx.isCustodyLinked && newTx.isAddingNewAccount && newTx.newAccountName) {
        const accountData = {
          name: newTx.newAccountName,
          balance: 0, // Initial balance is 0, will be updated by the transaction if needed
          userId: tenantId
        };
        const accRef = await addDoc(collection(db, 'custody_accounts'), accountData);
        
        pushToHistory({
          type: 'ADD',
          collection: 'custody_accounts',
          id: accRef.id,
          data: accountData
        });
        
        finalCustodyAccountId = accRef.id;
      }

      // 3. Handle New People (Main and Splits)
      const allPeopleNames = new Set<string>();
      if (finalPersonName) allPeopleNames.add(finalPersonName);
      finalSplits.forEach(s => {
        if (s.personName) allPeopleNames.add(s.personName);
      });

      for (const pName of Array.from(allPeopleNames)) {
        const personExists = persons.some(p => p.name.toLowerCase() === pName.toLowerCase());
        if (!personExists) {
          const personData = {
            name: pName,
            userId: tenantId,
            createdAt: Timestamp.now()
          };
          const personRef = await addDoc(collection(db, 'persons'), personData);
          
          pushToHistory({
            type: 'ADD',
            collection: 'persons',
            id: personRef.id,
            data: personData
          });
        }
      }

      const amount = parseFloat(newTx.amount);
      const custodyAmount = parseFloat(newTx.custodyAmount) || 0;

      if (isNaN(amount) || amount <= 0) {
        setFormStatus({ type: 'error', message: 'يرجى إدخال مبلغ صالح (أكبر من الصفر).' });
        return;
      }

      if (newTx.isCustodyLinked && isNaN(custodyAmount)) {
        setFormStatus({ type: 'error', message: 'يرجى إدخال مبلغ عهدة صالح.' });
        return;
      }
      const transactionData: any = {
        amount,
        type: newTx.type,
        category: finalCategory,
        description: newTx.description || '',
        personName: finalPersonName || '',
        date: Timestamp.now(),
        userId: tenantId,
        isCustodyLinked: newTx.isCustodyLinked || false,
        custodyAmount: parseFloat(newTx.custodyAmount) || 0,
        splits: finalSplits,
        splitType: newTx.splitType
      };

      if (finalCustodyAccountId) {
        transactionData.custodyAccountId = finalCustodyAccountId;
      }

      // 4. Add the transaction
      const txRef = await addDoc(collection(db, 'transactions'), transactionData);
      
      // Push to history
      pushToHistory({
        type: 'ADD',
        collection: 'transactions',
        id: txRef.id,
        data: transactionData
      });
      
      // 5. If it's linked to a custody account, update the balance
      if (finalCustodyAccountId) {
        const accountRef = doc(db, 'custody_accounts', finalCustodyAccountId);
        const cAmount = parseFloat(newTx.custodyAmount) || 0;
        
        if (cAmount !== 0) {
          // Income or custody_in increases balance, expense or custody_out decreases it
          const isPositive = newTx.type === 'income' || newTx.type === 'custody_in';
          const balanceChange = isPositive ? cAmount : -cAmount;
          
          await updateDoc(accountRef, {
            balance: increment(balanceChange)
          });
        }
      }

      setFormStatus({ type: 'success', message: 'تمت إضافة العملية بنجاح!' });
      setTimeout(() => {
        setShowAddModal(false);
        setFormStatus({ type: null, message: null });
        setNewTx({ 
          amount: '', 
          type: 'expense', 
          category: '', 
          description: '', 
          custodyAccountId: '', 
          custodyAmount: '', 
          personName: '', 
          isCustodyLinked: true,
          newCategoryName: '',
          newAccountName: '',
          isAddingNewCategory: false,
          isAddingNewAccount: false
        });
        setActiveTab('dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Add Transaction Error:', error);
      handleFirestoreError(error, 'create', 'transactions');
      setFormStatus({ type: 'error', message: `خطأ أثناء الحفظ: ${error.message || 'تأكد من الصلاحيات'}` });
    }
  };

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(tx => {
      const date = tx.date.toDate();
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthStr);
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  };

  const filteredTransactionsList = useMemo(() => {
    return transactions.filter(tx => {
      const matchesType = filterType === 'all' || tx.type === filterType;
      const matchesCustody = !showOnlyCustody || tx.custodyAccountId;
      
      // Advanced Filters
      const txDate = tx.date.toDate();
      const matchesStartDate = !advancedFilters.startDate || txDate >= new Date(advancedFilters.startDate);
      const matchesEndDate = !advancedFilters.endDate || txDate <= new Date(new Date(advancedFilters.endDate).setHours(23, 59, 59, 999));
      const matchesPerson = !advancedFilters.personName || tx.personName === advancedFilters.personName;
      const matchesCategory = !advancedFilters.category || tx.category === advancedFilters.category;
      const matchesCustodyAccount = !advancedFilters.custodyAccountId || tx.custodyAccountId === advancedFilters.custodyAccountId;
      const matchesMinAmount = !advancedFilters.minAmount || tx.amount >= parseFloat(advancedFilters.minAmount);
      const matchesMaxAmount = !advancedFilters.maxAmount || tx.amount <= parseFloat(advancedFilters.maxAmount);

      return matchesType && matchesCustody && matchesStartDate && matchesEndDate && matchesPerson && matchesCategory && matchesCustodyAccount && matchesMinAmount && matchesMaxAmount;
    });
  }, [transactions, filterType, showOnlyCustody, advancedFilters]);

  const totals = useMemo(() => {
    return filteredTransactionsList.reduce((acc, tx) => {
      if (tx.type === 'income') acc.income += tx.amount;
      if (tx.type === 'expense') acc.expense += tx.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactionsList]);

  const custodyTotal = useMemo(() => {
    return custodyAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [custodyAccounts]);
  
  const profitLoss = useMemo(() => totals.income - totals.expense, [totals]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-6 rounded-lg shadow-xl shadow-emerald-900/5 border border-white text-center"
        >
          <div className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
            <ReceiptText className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2 font-sans tracking-tight">المحاسب الذكي</h1>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            نظام محاسبي متطور لإدارة أموالك بكل سهولة.
          </p>

          <button 
            onClick={handleLogin}
            className="w-full bg-white border-2 border-emerald-100 text-gray-700 py-3 rounded-lg font-black text-sm flex items-center justify-center gap-3 hover:bg-emerald-50 transition-all active:scale-[0.95] shadow-sm mb-4"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            الدخول السريع بواسطة جوجل
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase px-2">أو الدخول اليدوي</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">اسم المستخدم</label>
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all text-right"
                  placeholder="اسم المستخدم"
                />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all pl-10 text-right"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {authError && (
              <div className="text-right space-y-1">
                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg">{authError}</p>
                {authError.includes('auth/operation-not-allowed') && (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
                    <p className="text-[10px] text-amber-800 leading-relaxed font-bold">
                      ⚠️ عذراً، يجب تفعيل "Email/Password" من لوحة تحكم Firebase أولاً لتتمكن من الدخول باسم المستخدم.
                    </p>
                    <p className="text-[9px] text-amber-700 mt-1">
                      اذهب إلى: Authentication {'->'} Sign-in method {'->'} Add new provider {'->'} Email/Password {'->'} Enable
                    </p>
                  </div>
                )}
              </div>
            )}
            <button 
              type="submit"
              disabled={authLoading}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-black text-sm hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري التحميل...
                </>
              ) : (
                'دخول النظام'
              )}
            </button>
          </form>

          <p className="mt-8 text-[10px] text-gray-400 font-bold">
            نظام المحاسب الذكي - نسخة الإدارة الآمنة
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F8FAFC]" dir="rtl">
      <Navbar 
        user={user} 
        userRole={userRole}
        onAddTransaction={() => setShowAddModal(true)} 
        onToggleDrawer={() => setIsDrawerOpen(true)} 
        onGoHome={() => { setActiveTab('dashboard'); setFilterType('all'); }}
      />

      <Sidebar 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userRole={userRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddTransaction={() => setShowAddModal(true)}
        onShowReminders={() => setShowRemindersModal(true)}
        onShowAccount={() => setShowAccountModal(true)}
        onShowSettings={() => setShowSettingsModal(true)}
        onShowCategories={() => setShowAddCategoryModal(true)}
        onShowUserManagement={() => setShowUserManagementModal(true)}
        onLogout={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Stats Grid */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-gray-800">نظرة عامة</h2>
          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                <button 
                  onClick={handleUndo}
                  disabled={historyState.pointer < 0}
                  className="p-2 hover:bg-gray-50 rounded-full text-gray-600 disabled:opacity-30 transition-all"
                  title="تراجع"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-100 mx-1"></div>
                <button 
                  onClick={handleRedo}
                  disabled={historyState.pointer >= historyState.history.length - 1}
                  className="p-2 hover:bg-gray-50 rounded-full text-gray-600 disabled:opacity-30 transition-all"
                  title="تقدم"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <button 
              onClick={generatePDFReport}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
            >
            {isGeneratingPDF ? (
              <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            ) : (
              <Printer className="w-4 h-4 text-emerald-600" />
            )}
            تصدير PDF
          </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          <StatCard 
            title="إجمالي الإيرادات" 
            amount={totals.income} 
            icon={ArrowUpRight} 
            color="bg-emerald-500" 
            onClick={() => { setFilterType('income'); setActiveTab('transactions'); }}
          />
          <StatCard 
            title="إجمالي المصاريف" 
            amount={totals.expense} 
            icon={ArrowDownLeft} 
            color="bg-rose-500" 
            onClick={() => { setFilterType('expense'); setActiveTab('transactions'); }}
          />
          <StatCard 
            title="إجمالي العهدة" 
            amount={custodyTotal} 
            icon={Coins} 
            color="bg-amber-500" 
            onClick={() => setActiveTab('custody')}
          />
          <StatCard 
            title="صافي الربح | الخسارة" 
            amount={profitLoss} 
            icon={PieChartIcon} 
            color={profitLoss >= 0 ? "bg-blue-500" : "bg-orange-500"} 
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-0.5 rounded-xl w-full">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'dashboard' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              لوحة التحكم
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'transactions' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <History className="w-4 h-4" />
              العمليات
            </div>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
            >
              {/* Financial Flow Analysis */}
              <div 
                className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:border-emerald-200 transition-all"
                onClick={() => { setFilterType('all'); setShowOnlyCustody(false); setActiveTab('transactions'); }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="w-10"></div>
                  <h3 className="text-[12px] font-black text-emerald-600 text-center">تحليل التدفق المالي</h3>
                  <button onClick={(e) => { e.stopPropagation(); setFilterType('all'); setShowOnlyCustody(false); setActiveTab('transactions'); }} className="text-emerald-600 text-[9px] font-semibold hover:underline">عرض الكل</button>
                </div>
                <div className="h-[100px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={[
                        { name: 'ايرادات', value: totals.income, label: `${totals.income.toLocaleString('en-US')} د.ك` },
                        { name: 'مصاريف', value: totals.expense, label: `${totals.expense.toLocaleString('en-US')} د.ك` },
                        { name: 'عهدة', value: custodyTotal, label: `${custodyTotal.toLocaleString('en-US')} د.ك` }
                      ]}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={(props: any) => {
                          const { x, y, payload } = props;
                          const item = [
                            { name: 'ايرادات', label: `${totals.income.toLocaleString('en-US')} د.ك` },
                            { name: 'مصاريف', label: `${totals.expense.toLocaleString('en-US')} د.ك` },
                            { name: 'عهدة', label: `${custodyTotal.toLocaleString('en-US')} د.ك` }
                          ].find(d => d.name === payload.value);
                          
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <text x={0} y={10} dy={0} textAnchor="middle" fill="#64748B" fontSize={10} fontWeight="bold">{payload.value}</text>
                              <text x={0} y={22} dy={0} textAnchor="middle" fill="#94A3B8" fontSize={9}>{item?.label}</text>
                            </g>
                          );
                        }}
                      />
                      <YAxis hide domain={[0, 'auto']} />
                      <Tooltip 
                        cursor={{ fill: '#F8FAFC' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                        <Cell fill="#10B981" />
                        <Cell fill="#F43F5E" />
                        <Cell fill="#F59E0B" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-2">
                <MonthlyReport 
                  transactions={transactions} 
                  onClick={() => { setFilterType('expense'); setActiveTab('transactions'); }} 
                />
              </div>

              {/* Income Distribution Chart */}
              <IncomeReport 
                transactions={transactions} 
                onClick={() => { setFilterType('income'); setActiveTab('transactions'); }} 
              />

              {/* Latest Transactions */}
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="w-10"></div> {/* Spacer for symmetry */}
                  <h3 className="text-sm font-black text-emerald-600">آخر العمليات</h3>
                  <button onClick={() => { setFilterType('all'); setShowOnlyCustody(false); setActiveTab('transactions'); }} className="text-emerald-600 text-[10px] font-semibold hover:underline">عرض الكل</button>
                </div>
                <div className="space-y-1">
                  {filteredTransactionsList.slice(0, 4).map((tx) => {
                    const custodyAccount = tx.custodyAccountId ? custodyAccounts.find(acc => acc.id === tx.custodyAccountId) : null;
                    return (
                    <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-full transition-colors border border-transparent">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1.5 rounded-full ${
                          tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 
                          tx.type === 'expense' ? 'bg-rose-100 text-rose-600' : 
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {tx.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-xs truncate">{tx.category}</p>
                          <div className="flex items-center gap-1">
                            <p className="text-[9px] text-gray-500">{format(tx.date.toDate(), 'd MMM', { locale: ar })}</p>
                            {tx.splits && tx.splits.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 rounded-full font-bold">مقسم</span>
                                <div className="flex gap-1 overflow-hidden">
                                  {tx.splits.slice(0, 2).map((s: any, i: number) => (
                                    <span key={i} className="text-[7px] text-gray-400 whitespace-nowrap">
                                      {s.personName} ({s.percentage?.toFixed(0)}%)
                                    </span>
                                  ))}
                                  {tx.splits.length > 2 && <span className="text-[7px] text-gray-400">...</span>}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {custodyAccount && (
                          <div className="relative group/custody-dash">
                            <Coins className="w-3 h-3 text-amber-500 cursor-help" />
                            <div className="absolute bottom-full right-0 mb-1 hidden group-hover/custody-dash:block bg-gray-900 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-50 shadow-lg border border-white/10">
                              عهدة: {custodyAccount.name}
                            </div>
                          </div>
                        )}
                        <p className={`font-bold text-xs shrink-0 flex items-center gap-1 ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          <FormattedNumber value={tx.amount} />
                        </p>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>

              {/* Expense Distribution */}
              <div 
                className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-200 transition-all"
                onClick={() => { setFilterType('expense'); setActiveTab('transactions'); }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="w-10"></div>
                  <h3 className="text-sm font-black text-emerald-600 text-center">توزيع المصاريف</h3>
                  <button onClick={(e) => { e.stopPropagation(); setFilterType('expense'); setActiveTab('transactions'); }} className="text-emerald-600 text-[10px] font-semibold hover:underline">عرض الكل</button>
                </div>
                <div className="flex items-center justify-between h-[140px]">
                  {/* Legend (Left/Center) */}
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-full pr-2">
                    {(() => {
                      const expenseData = filteredTransactionsList.filter(t => t.type === 'expense').reduce((acc: any[], t) => {
                        const existing = acc.find(x => x.name === t.category);
                        if (existing) existing.value += t.amount;
                        else acc.push({ name: t.category, value: t.amount });
                        return acc;
                      }, []);
                      const colors = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6'];
                      
                      return expenseData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></div>
                          <span className="text-[10px] font-bold text-gray-700 truncate">{item.name}</span>
                          <span className="text-[9px] text-gray-400 mr-auto">{item.value.toLocaleString('en-US')}</span>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Chart (Right) */}
                  <div className="w-[120px] h-full shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={filteredTransactionsList.filter(t => t.type === 'expense').reduce((acc: any[], t) => {
                            const existing = acc.find(x => x.name === t.category);
                            if (existing) existing.value += t.amount;
                            else acc.push({ name: t.category, value: t.amount });
                            return acc;
                          }, [])}
                          innerRadius={35}
                          outerRadius={50}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '9px', borderRadius: '8px', border: 'none' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* People Summary */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <div className="w-10"></div>
                  <h3 className="text-sm font-black text-emerald-600 text-center">ملخص الاشخاص</h3>
                  <div className="w-10"></div>
                </div>
                <div className="space-y-3 overflow-y-auto max-h-[160px] pr-1">
                  {(() => {
                    const peopleData = filteredTransactionsList.reduce((acc: any, t) => {
                      // Handle main person
                      if (t.personName) {
                        if (!acc[t.personName]) {
                          acc[t.personName] = { income: 0, expense: 0 };
                        }
                        if (t.type === 'income') acc[t.personName].income += t.amount;
                        if (t.type === 'expense') acc[t.personName].expense += t.amount;
                      }
                      
                      // Handle splits
                      if (t.splits && t.splits.length > 0) {
                        t.splits.forEach((split: any) => {
                          if (!acc[split.personName]) {
                            acc[split.personName] = { income: 0, expense: 0 };
                          }
                          if (t.type === 'income') acc[split.personName].income += split.amount;
                          if (t.type === 'expense') acc[split.personName].expense += split.amount;
                        });
                      }
                      return acc;
                    }, {});

                    const peopleList = Object.entries(peopleData).map(([name, totals]: [string, any]) => ({
                      name,
                      ...totals,
                      balance: totals.income - totals.expense
                    }));

                    if (peopleList.length === 0) {
                      return <p className="text-[10px] text-gray-400 text-center py-4">لا توجد بيانات اشخاص بعد</p>;
                    }

                    return peopleList.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)).map((person) => (
                      <div key={person.name} className="p-2 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-black text-gray-900">{person.name}</span>
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${person.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            <FormattedNumber value={person.balance} /> د.ك
                          </span>
                        </div>
                        <div className="flex gap-4 text-[9px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            ايراد: <FormattedNumber value={person.income} />
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                            مصروف: <FormattedNumber value={person.expense} />
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div 
              key="transactions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[70vh]"
            >
              <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 w-full sm:w-48">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    title="العودة للرئيسية"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-bold text-gray-400 hidden sm:inline">العودة</span>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-black text-emerald-600">سجل العمليات</h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                    {(filterType !== 'all' || showOnlyCustody || Object.values(advancedFilters).some(v => v !== '')) && (
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {filterType !== 'all' && (
                          <span className={`px-2 py-0.5 rounded-2xl text-[10px] font-bold ${
                            filterType === 'income' ? 'bg-emerald-50 text-emerald-600' : 
                            filterType === 'expense' ? 'bg-rose-50 text-rose-600' : 
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {filterType === 'income' ? 'إيرادات' : filterType === 'expense' ? 'مصاريف' : 'عهدة'}
                          </span>
                        )}
                        {showOnlyCustody && (
                          <span className="px-2 py-0.5 rounded-2xl text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                            العهدة فقط
                          </span>
                        )}
                        {Object.values(advancedFilters).some(v => v !== '') && (
                          <span className="px-2 py-0.5 rounded-2xl text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            تصفية متقدمة
                          </span>
                        )}
                        <button 
                          onClick={() => { 
                            setFilterType('all'); 
                            setShowOnlyCustody(false);
                            setAdvancedFilters({
                              month: '',
                              startDate: '',
                              endDate: '',
                              personName: '',
                              category: '',
                              custodyAccountId: '',
                              minAmount: '',
                              maxAmount: ''
                            });
                          }}
                          className="text-[10px] text-gray-400 hover:text-gray-600 underline font-bold"
                        >
                          إلغاء الكل
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={() => setShowOnlyCustody(!showOnlyCustody)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-2xl text-[10px] font-bold transition-all ${
                        showOnlyCustody 
                          ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                          : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      <Filter className="w-3 h-3" />
                      العمليات المرتبطة بعهدة فقط
                    </button>
                    <button 
                      onClick={() => setShowFilterModal(true)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-2xl text-[10px] font-bold transition-all ${
                        Object.values(advancedFilters).some(v => v !== '')
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      تصفية متقدمة
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto flex-1 sm:flex-none sm:justify-end">
                  <button 
                    onClick={handleManualSyncToSheets}
                    disabled={isSyncing}
                    className="flex-1 sm:flex-none bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    تصدير للجدول
                  </button>
                  <button 
                    onClick={syncFromSheets}
                    disabled={isSyncing}
                    className="flex-1 sm:flex-none bg-blue-50 text-blue-600 px-6 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    <Download className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                    مزامنة من الجدول
                  </button>
                </div>
              </div>
              


              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-gray-100/50 text-gray-600 text-[11px] font-bold uppercase tracking-wider border-b border-gray-200">
                      <th className="px-4 py-2 font-bold">التاريخ</th>
                      <th className="px-4 py-2 font-bold">الشخص</th>
                      <th className="px-4 py-2 font-bold">المبلغ</th>
                      <th className="px-4 py-2 font-bold">الفئة</th>
                      <th className="px-4 py-2 font-bold">النوع</th>
                      <th className="px-4 py-2 font-bold">الوصف</th>
                      <th className="px-4 py-2 font-bold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredTransactionsList.map((tx, index) => {
                        const custodyAccount = tx.custodyAccountId ? custodyAccounts.find(acc => acc.id === tx.custodyAccountId) : null;
                        return (
                        <tr 
                          key={tx.id} 
                          className={`transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'
                          } hover:bg-emerald-50/60 group border-b border-gray-50 last:border-0`}
                        >
                        <td className="px-4 py-2 text-[11px] text-gray-600">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{format(tx.date.toDate(), 'HH:mm')}</span>
                            <span className="text-[10px] opacity-70">{format(tx.date.toDate(), 'yyyy/MM/dd')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 font-bold text-xs text-emerald-600">
                          {tx.splits && tx.splits.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 opacity-60" />
                                <span className="text-[10px] text-gray-400">مقسم على {tx.splits.length}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {tx.splits.map((s: any, i: number) => (
                                  <span key={i} className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] border border-emerald-100 flex items-center gap-1">
                                    <span className="font-black">{s.personName}:</span>
                                    <FormattedNumber value={s.amount} />
                                    <span className="text-[8px] opacity-60">({s.percentage?.toFixed(0)}%)</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            tx.personName || '-'
                          )}
                        </td>
                        <td className={`px-4 py-2 font-bold text-xs flex items-center gap-1 ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          <FormattedNumber value={tx.amount} /> <span className="text-[9px] font-normal opacity-70">د.ك</span>
                          {custodyAccount && (
                            <div className="relative group/custody ml-1">
                              <Coins className="w-3.5 h-3.5 text-amber-500 cursor-help" />
                              <div className="absolute bottom-full right-0 mb-1 hidden group-hover/custody:block bg-gray-900 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-50 shadow-lg border border-white/10">
                                عهدة: {custodyAccount.name}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 font-bold text-xs text-gray-900">{tx.category}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-2xl text-[10px] font-bold ${
                            tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 
                            tx.type === 'expense' ? 'bg-rose-50 text-rose-600' : 
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {tx.type === 'income' ? 'إيراد' : tx.type === 'expense' ? 'مصروف' : 'عهدة'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[11px] text-gray-500 max-w-[120px] truncate">{tx.description || '-'}</td>
                        <td className="px-4 py-2">
                          {userRole === 'admin' && (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingTransaction(tx);
                                  setShowEditModal(true);
                                }}
                                className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-400 hover:text-blue-600 transition-all"
                                title="تعديل"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setConfirmDialog({
                                    isOpen: true,
                                    message: 'هل أنت متأكد من حذف هذه العملية؟',
                                  onConfirm: async () => {
                                    try {
                                      if (tx.custodyAccountId) {
                                        const accountRef = doc(db, 'custody_accounts', tx.custodyAccountId);
                                        const balanceChange = (tx.type === 'income' || tx.type === 'custody_in') ? -tx.amount : tx.amount;
                                        await updateDoc(accountRef, {
                                          balance: increment(balanceChange)
                                        });
                                      }
                                      
                                      // Push to history before deleting
                                      const { id: _id, ...dataWithoutId } = tx;
                                      pushToHistory({
                                        type: 'DELETE',
                                        collection: 'transactions',
                                        id: tx.id!,
                                        data: dataWithoutId
                                      });
                                      
                                      await deleteDoc(doc(db, 'transactions', tx.id!));
                                    } catch (err) {
                                      handleFirestoreError(err, 'delete', 'transactions');
                                    }
                                  }
                                });
                              }}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                              title="حذف العملية"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          )}
                        </td>
                    </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'custody' && (
            <motion.div 
              key="custody"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 min-h-[70vh]"
            >
              <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div>
                  <h3 className="text-lg font-black text-emerald-600">إدارة العهدة المالية</h3>
                  <p className="text-xs text-gray-500">عرض وإدارة جميع حسابات العهدة الخاصة بك</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {custodyAccounts.map((acc) => (
                  <div key={acc.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 relative group">
                    <div className="flex justify-between items-start mb-1">
                      <div className="bg-amber-100 p-1.5 rounded-full text-amber-600">
                        <Wallet className="w-3.5 h-3.5" />
                      </div>
                      {userRole === 'admin' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingCustody(acc);
                              setNewCustodyName(acc.name);
                              setNewCustodyBalance(acc.balance.toString());
                              setShowAddCustodyModal(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-700 p-1"
                          >
                            تعديل
                          </button>
                          <button 
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                message: 'هل أنت متأكد من حذف حساب العهدة؟',
                                onConfirm: async () => {
                                  const { id: _id, ...accData } = acc;
                                  pushToHistory({
                                    type: 'DELETE',
                                    collection: 'custody_accounts',
                                    id: acc.id!,
                                    data: accData
                                  });
                                  await deleteDoc(doc(db, 'custody_accounts', acc.id!));
                                }
                              });
                            }}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            حذف
                          </button>
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-0.5">{acc.name}</h4>
                    <p className="text-xl font-black text-amber-600 flex items-center gap-1">
                      <FormattedNumber value={acc.balance} /> <span className="text-[10px] font-normal text-gray-400">د.ك</span>
                    </p>
                  </div>
                ))}
                
                {userRole === 'admin' && (
                  <button 
                    onClick={() => {
                      setEditingCustody(null);
                      setNewCustodyName('');
                      setNewCustodyBalance('0');
                      setShowAddCustodyModal(true);
                    }}
                    className="border-2 border-dashed border-gray-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all group"
                  >
                    <PlusCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm">إضافة حساب عهدة</span>
                  </button>
                )}
              </div>

              {/* Custody Transactions Box */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-8">
                <h3 className="text-lg font-black text-gray-900 mb-4">سجل عمليات العهدة</h3>
                <div className="space-y-4">
                  {transactions.filter(tx => tx.isCustodyLinked).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{tx.description || tx.category}</p>
                        <p className="text-[10px] text-gray-400">{format(tx.date.toDate(), 'yyyy/MM/dd', { locale: ar })}</p>
                      </div>
                      <div className={`font-black text-sm ${tx.type === 'income' || tx.type === 'custody_in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'income' || tx.type === 'custody_in' ? '+' : '-'}<FormattedNumber value={tx.amount} />
                      </div>
                    </div>
                  ))}
                  {transactions.filter(tx => tx.isCustodyLinked).length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">لا توجد عمليات عهدة مسجلة</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <PersonsModal 
        isOpen={showPersonsModal}
        onClose={() => setShowPersonsModal(false)}
        persons={persons}
        tenantId={tenantId}
        db={db}
        pushToHistory={pushToHistory}
        editingPerson={editingPerson}
        setEditingPerson={setEditingPerson}
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
        onDeletePerson={(person) => {
          const transactionsToDelete = transactions.filter(t => t.personName === person.name);
          // Note: In a real app we might want to delete from Firestore too, 
          // but for now keeping the original logic of filtering local state + history
          setTransactions(prev => prev.filter(t => t.personName !== person.name));
          pushToHistory({ type: 'DELETE_PERSON', oldData: { ...person }, data: null });
          setPersons(prev => prev.filter(p => p.id !== person.id));
          showToast(`تم حذف ${person.name} وجميع معاملاته`, 'success');
          setConfirmDelete(null);
        }}
        onEditPerson={(person, newName) => {
          pushToHistory({ type: 'EDIT_PERSON', oldData: { ...person }, data: { ...person, name: newName } });
          setPersons(prev => prev.map(p => p.id === person.id ? { ...p, name: newName } : p));
          setEditingPerson(null);
        }}
      />

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-black text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من حذف {confirmDelete.name}؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 rounded-xl font-bold text-sm bg-gray-100 text-gray-700"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    const personToDelete = confirmDelete;
                    const transactionsToDelete = transactions.filter(t => t.personName === personToDelete.name);
                    
                    // Remove transactions
                    setTransactions(prev => prev.filter(t => t.personName !== personToDelete.name));
                    
                    // Remove person
                    pushToHistory({ type: 'DELETE_PERSON', oldData: { ...personToDelete }, data: null });
                    setPersons(prev => prev.filter(p => p.id !== personToDelete.id));
                    
                    showToast(`تم حذف ${personToDelete.name} وجميع معاملاته`, 'success');
                    setConfirmDelete(null);
                  }}
                  className="flex-1 py-2 rounded-xl font-bold text-sm bg-rose-600 text-white"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <UserManagementModal 
        isOpen={showUserManagementModal}
        onClose={() => setShowUserManagementModal(false)}
        allUsers={allUsers}
        newUserForm={newUserForm}
        setNewUserForm={setNewUserForm}
        formStatus={formStatus}
        handleCreateUser={handleCreateUser}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        editUserForm={editUserForm}
        setEditUserForm={setEditUserForm}
        handleEditUserSubmit={handleEditUserSubmit}
        handleUpdateUserRole={handleUpdateUserRole}
        handleDeleteUser={handleDeleteUser}
        currentUser={user}
      />
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <div className="w-5"></div>
                <h3 className="text-lg font-black text-emerald-600">تصفية متقدمة</h3>
                <button onClick={() => setShowFilterModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">الشهر</label>
                    <select 
                      value={advancedFilters.month}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          setAdvancedFilters({ ...advancedFilters, month: '', startDate: '', endDate: '' });
                          return;
                        }
                        const [year, month] = val.split('-');
                        const startDate = `${year}-${month}-01`;
                        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
                        const endDate = `${year}-${month}-${lastDay}`;
                        setAdvancedFilters({ ...advancedFilters, month: val, startDate, endDate });
                      }}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-sm font-bold text-right focus:ring-[12px] focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white/60 transition-all outline-none appearance-none cursor-pointer"
                    >
                    <option value="">كل الأشهر</option>
                    {availableMonths.map(m => (
                      <option key={m} value={m}>{formatMonth(m)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">من تاريخ</label>
                    <input 
                      type="date" 
                      value={advancedFilters.startDate}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, month: '', startDate: e.target.value })}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-sm font-bold text-right focus:ring-[12px] focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white/60 transition-all outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">إلى تاريخ</label>
                    <input 
                      type="date" 
                      value={advancedFilters.endDate}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, month: '', endDate: e.target.value })}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-sm font-bold text-right focus:ring-[12px] focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white/60 transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">الشخص</label>
                    <input 
                      type="text"
                      list="persons-list-search"
                      value={advancedFilters.personName}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, personName: e.target.value })}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-sm font-bold text-right focus:ring-[12px] focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white/60 transition-all outline-none shadow-sm"
                      placeholder="الكل"
                    />
                    <datalist id="persons-list-search">
                      {persons.map(p => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">الفئة</label>
                    <input 
                      type="text"
                      list="categories-list-search"
                      value={advancedFilters.category}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, category: e.target.value })}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-sm font-bold text-right focus:ring-[12px] focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white/60 transition-all outline-none shadow-sm"
                      placeholder="الكل"
                    />
                    <datalist id="categories-list-search">
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">حساب العهدة</label>
                  <select 
                    value={advancedFilters.custodyAccountId}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, custodyAccountId: e.target.value })}
                    className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-sm font-bold text-right focus:ring-[12px] focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white/60 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="">كل الحسابات</option>
                    {custodyAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">أقل مبلغ</label>
                    <input 
                      type="number" 
                      value={advancedFilters.minAmount}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, minAmount: e.target.value })}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-sm font-bold text-right focus:ring-[12px] focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white/60 transition-all outline-none shadow-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">أكبر مبلغ</label>
                    <input 
                      type="number" 
                      value={advancedFilters.maxAmount}
                      onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxAmount: e.target.value })}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-sm font-bold text-right focus:ring-[12px] focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white/60 transition-all outline-none shadow-sm"
                      placeholder="لا يوجد"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => {
                      setAdvancedFilters({
                        month: '',
                        startDate: '',
                        endDate: '',
                        personName: '',
                        category: '',
                        custodyAccountId: '',
                        minAmount: '',
                        maxAmount: ''
                      });
                      setShowFilterModal(false);
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                  >
                    مسح التصفية
                  </button>
                  <button 
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    تطبيق
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
      <CategoryModal 
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        categories={categories}
        userRole={userRole}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAddCategory={handleAddCategory}
        onDeleteCategory={(cat) => {
          setConfirmDialog({
            isOpen: true,
            message: 'هل انت متأكد من حذف هذه الفئة؟',
            onConfirm: async () => {
              try {
                const { id: _id, ...catData } = cat;
                pushToHistory({
                  type: 'DELETE',
                  collection: 'categories',
                  id: cat.id,
                  data: catData
                });
                await deleteDoc(doc(db, 'categories', cat.id));
              } catch (err) {
                handleFirestoreError(err, 'delete', 'categories');
              }
            }
          });
        }}
      />
      </AnimatePresence>
      <AnimatePresence>
        {showEditModal && editingTransaction && (
          <TransactionModal 
            mode="edit"
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSubmit={handleUpdateTransaction}
            transaction={editingTransaction}
            setTransaction={(tx: any) => setEditingTransaction(tx)}
            categories={categories}
            persons={persons}
            custodyAccounts={custodyAccounts}
            formStatus={formStatus}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <TransactionModal 
            mode="add"
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddTransaction}
            transaction={newTx}
            setTransaction={setNewTx}
            categories={categories}
            persons={persons}
            custodyAccounts={custodyAccounts}
            formStatus={formStatus}
          />
        )}
      </AnimatePresence>
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full h-full shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="w-10"></div>
                <h3 className="text-lg font-black text-gray-900">اعدادات Google Sheets</h3>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="bg-blue-50 p-3 rounded-2xl text-[10px] text-blue-700 leading-relaxed">
                  <strong>كيفية الربط:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-0.5">
                    <li>أنشئ ملف Google Sheet جديد.</li>
                    <li>اذهب الى Extensions ثم Apps Script.</li>
                    <li>انسخ الكود أدناه والصقه هناك.</li>
                    <li>قم بعمل Deploy كـ Web App وانسخ الرابط هنا.</li>
                  </ol>
                  <div className="mt-2 relative group">
                    <div className="p-2 bg-white/50 rounded-lg font-mono text-[8px] overflow-x-auto whitespace-pre pr-8">
{`function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.clear();
  sheet.appendRow(['ID', 'Date', 'Category', 'Type', 'Amount', 'Description', 'Person', 'Is Custody Linked', 'Custody Account ID', 'Custody Account Name', 'Custody Amount']);
  data.forEach(function(tx) {
    sheet.appendRow([tx.id, tx.date, tx.category, tx.type, tx.amount, tx.description, tx.personName, tx.isCustodyLinked, tx.custodyAccountId, tx.custodyAccountName, tx.custodyAmount]);
  });
  return ContentService.createTextOutput("Success");
}`}
                    </div>
                    <button 
                      onClick={() => {
                        const code = `function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sheet.clear();
  sheet.appendRow(['ID', 'Date', 'Category', 'Type', 'Amount', 'Description', 'Person', 'Is Custody Linked', 'Custody Account ID', 'Custody Account Name', 'Custody Amount']);
  data.forEach(function(tx) {
    sheet.appendRow([tx.id, tx.date, tx.category, tx.type, tx.amount, tx.description, tx.personName, tx.isCustodyLinked, tx.custodyAccountId, tx.custodyAccountName, tx.custodyAmount]);
  });
  return ContentService.createTextOutput("Success");
}`;
                        navigator.clipboard.writeText(code);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="absolute top-1 left-1 p-1.5 bg-white/80 hover:bg-white rounded-md shadow-sm border border-blue-100 text-blue-600 transition-all active:scale-90"
                      title="نسخ الكود"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 mr-1">رابط Web App (Apps Script)</label>
                  <input 
                    type="text" 
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    readOnly={userRole !== 'admin'}
                    className={`ios-input ${userRole !== 'admin' ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder="https://script.google.com/macros/s/.../exec"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <h4 className="ios-section-title !px-0 !mb-0 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    إعدادات الإشعارات
                  </h4>
                  <div className="flex items-center justify-between bg-gray-100/50 px-4 py-3 rounded-xl">
                    <span className="text-sm font-semibold text-gray-700">تفعيل إشعارات الدفع (Push)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-ios-blue)]"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1.5 mr-1">VAPID Key (للمطورين)</label>
                    <input 
                      type="text" 
                      value={vapidKey}
                      onChange={(e) => setVapidKey(e.target.value)}
                      className="ios-input"
                      placeholder="أدخل مفتاح VAPID الخاص بـ Firebase Messaging"
                    />
                  </div>
                </div>

                {userRole === 'admin' && (
                  <button 
                    onClick={async () => {
                      if (user && tenantId) {
                        try {
                          await setDoc(doc(db, 'settings', tenantId), { 
                            sheetUrl,
                            notificationsEnabled,
                            vapidKey
                          }, { merge: true });
                          setShowSettingsModal(false);
                          setToast({ message: 'تم حفظ الاعدادات بنجاح', type: 'success' });
                        } catch (err) {
                          console.error('Error saving settings:', err);
                          setToast({ message: 'فشل حفظ الاعدادات', type: 'error' });
                        }
                      }
                    }}
                    className="ios-button-primary w-full shadow-lg shadow-blue-500/20"
                  >
                    حفظ الاعدادات
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reminders Modal */}
      <AnimatePresence>
        {showRemindersModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRemindersModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-[var(--color-ios-background)] w-full h-full shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="w-10"></div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">التذكيرات والمواعيد</h3>
                <button onClick={() => setShowRemindersModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar">
                {/* Add New Reminder Form */}
                <div className="ios-card p-5 space-y-4">
                  <h4 className="ios-section-title !px-0 !mb-0 flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" />
                    إضافة تذكير جديد
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1.5 mr-1">عنوان التذكير</label>
                      <input 
                        type="text" 
                        value={newReminderTitle}
                        onChange={(e) => setNewReminderTitle(e.target.value)}
                        className="ios-input"
                        placeholder="مثلاً: موعد دفع الإيجار"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1.5 mr-1">التاريخ والوقت</label>
                        <input 
                          type="datetime-local" 
                          value={newReminderDueDate}
                          onChange={(e) => setNewReminderDueDate(e.target.value)}
                          className="ios-input"
                        />
                      </div>
                      <div className="flex items-center justify-between bg-gray-100/50 px-4 py-3 rounded-xl">
                        <span className="text-sm font-semibold text-gray-700">تذكير متكرر</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={newReminderIsRecurring}
                            onChange={(e) => setNewReminderIsRecurring(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-ios-blue)]"></div>
                        </label>
                      </div>
                    </div>
                    {newReminderIsRecurring && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1.5 mr-1">التكرار</label>
                          <select 
                            value={newReminderFrequency}
                            onChange={(e) => setNewReminderFrequency(e.target.value as any)}
                            className="ios-input appearance-none"
                          >
                            <option value="daily">يومي</option>
                            <option value="weekly">أسبوعي</option>
                            <option value="monthly">شهري</option>
                            <option value="yearly">سنوي</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                    <button 
                      onClick={handleAddReminder}
                      className="ios-button-primary w-full flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                      <Save className="w-5 h-5" />
                      حفظ التذكير
                    </button>
                  </div>
                </div>

                {/* Reminders List */}
                <div className="space-y-3">
                  <h4 className="ios-section-title flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    قائمة التذكيرات الحالية
                  </h4>
                  {reminders.length === 0 ? (
                    <div className="ios-card py-12 flex flex-col items-center justify-center text-center px-6">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400 font-semibold">لا توجد تذكيرات مفعلة حالياً</p>
                    </div>
                  ) : (
                    <div className="ios-list-group">
                      {reminders.sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis()).map((reminder) => (
                        <div 
                          key={reminder.id}
                          className={`ios-list-item !block p-4 ${!reminder.enabled && 'opacity-50'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                              <div className={`p-2.5 rounded-xl ${reminder.enabled ? 'bg-blue-50 text-[var(--color-ios-blue)]' : 'bg-gray-100 text-gray-400'}`}>
                                <Bell className="w-5 h-5" />
                              </div>
                              <div>
                                <h5 className="text-base font-bold text-gray-900">{reminder.title}</h5>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                  <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {format(reminder.dueDate.toDate(), 'yyyy/MM/dd')}
                                  </span>
                                  <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {format(reminder.dueDate.toDate(), 'HH:mm')}
                                  </span>
                                  {reminder.isRecurring && (
                                    <span className="text-[10px] text-[var(--color-ios-blue)] font-bold flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-full">
                                      <RefreshCw className="w-3 h-3" />
                                      {reminder.frequency === 'daily' ? 'يومي' : 
                                       reminder.frequency === 'weekly' ? 'أسبوعي' : 
                                       reminder.frequency === 'monthly' ? 'شهري' : 'سنوي'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleReminderEnabled(reminder)}
                                className={`p-2 rounded-full transition-all active:scale-90 ${reminder.enabled ? 'bg-blue-50 text-[var(--color-ios-blue)]' : 'bg-gray-100 text-gray-400'}`}
                                title={reminder.enabled ? 'تعطيل' : 'تفعيل'}
                              >
                                {reminder.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              </button>
                              <button 
                                onClick={() => handleDeleteReminder(reminder.id)}
                                className="p-2 text-[var(--color-ios-red)] hover:bg-rose-50 rounded-full transition-all active:scale-90"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-5 bg-white/50 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed">
                  * سيتم إرسال إشعارات فورية لهاتفك أو متصفحك عند حلول الموعد المحدد. 
                  تأكد من تفعيل الإشعارات في إعدادات التطبيق.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Custody Modal */}
      <AnimatePresence>
        {showAddCustodyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddCustodyModal(false);
                setEditingCustody(null);
                setNewCustodyName('');
                setNewCustodyBalance('0');
              }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full h-full shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="w-10"></div>
                <h3 className="text-lg font-black text-gray-900">
                  {editingCustody ? 'تعديل حساب العهدة' : 'اضافة حساب عهدة جديد'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddCustodyModal(false);
                    setEditingCustody(null);
                    setNewCustodyName('');
                    setNewCustodyBalance('0');
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">اسم الحساب</label>
                  <input 
                    type="text" 
                    value={newCustodyName}
                    onChange={(e) => setNewCustodyName(e.target.value)}
                    className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-sm font-bold text-right focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm"
                    placeholder="مثال: عهدة المشتريات"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">الرصيد الحالي</label>
                  <input 
                    type="number" 
                    value={newCustodyBalance}
                    onChange={(e) => setNewCustodyBalance(e.target.value)}
                    className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-sm font-bold text-right focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm"
                    placeholder="0.00"
                  />
                </div>
                <button 
                  onClick={async () => {
                    if (userRole !== 'admin') return;
                    if (newCustodyName && user) {
                      const balance = parseFloat(newCustodyBalance) || 0;
                      if (editingCustody) {
                        const { id: _id, ...oldData } = editingCustody;
                        const newData = { ...oldData, name: newCustodyName, balance: balance };
                        pushToHistory({
                          type: 'UPDATE',
                          collection: 'custody_accounts',
                          id: editingCustody.id!,
                          data: newData,
                          oldData: oldData
                        });
                        await updateDoc(doc(db, 'custody_accounts', editingCustody.id!), {
                          name: newCustodyName,
                          balance: balance
                        });
                      } else {
                        const accountData = {
                          name: newCustodyName,
                          balance: balance,
                          userId: tenantId
                        };
                        const docRef = await addDoc(collection(db, 'custody_accounts'), accountData);
                        
                        pushToHistory({
                          type: 'ADD',
                          collection: 'custody_accounts',
                          id: docRef.id,
                          data: accountData
                        });
                      }
                      setNewCustodyName('');
                      setNewCustodyBalance('0');
                      setEditingCustody(null);
                      setShowAddCustodyModal(false);
                    }
                  }}
                  className="w-full bg-gray-900 text-white py-3 rounded-2xl font-black text-sm hover:bg-gray-800 transition-all"
                >
                  {editingCustody ? 'حفظ التعديلات' : 'اضافة الحساب'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
                <p className="text-gray-500">{confirmDialog.message}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  disabled={confirmDialog.isLoading}
                  onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  تراجع
                </button>
                <button 
                  disabled={confirmDialog.isLoading}
                  onClick={async () => {
                    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
                    try {
                      await confirmDialog.onConfirm();
                      setConfirmDialog({ ...confirmDialog, isOpen: false, isLoading: false });
                    } catch (error) {
                      console.error('Confirm Dialog Error:', error);
                      setConfirmDialog(prev => ({ ...prev, isLoading: false }));
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {confirmDialog.isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'تأكيد الحذف'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Account Management Modal */}
        {showAccountModal && user && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAccountModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full h-full shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
                <div className="w-10"></div>
                <h3 className="text-xl font-bold text-gray-900">ادارة الحساب</h3>
                <button onClick={() => setShowAccountModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-6">

              <div className="mb-6 p-4 bg-emerald-50 rounded-2xl flex items-center gap-3">
                <img src={user.photoURL || ''} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="" />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{user.displayName}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <h4 className="font-bold text-gray-700 text-sm mb-2">تغيير / اضافة كلمة مرور</h4>
                
                {user.providerData.some(p => p.providerId === 'password') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">كلمة المرور الحالية</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={accountForm.currentPassword}
                        onChange={e => setAccountForm({ ...accountForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl font-bold text-right focus:ring-2 focus:ring-emerald-500 outline-none transition-all pl-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 mr-2">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={accountForm.newPassword}
                      onChange={e => setAccountForm({ ...accountForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl font-bold text-right focus:ring-2 focus:ring-emerald-500 outline-none transition-all pl-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 mr-2">تأكيد كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={accountForm.confirmPassword}
                      onChange={e => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl font-bold text-right focus:ring-2 focus:ring-emerald-500 outline-none transition-all pl-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {formStatus.message && (
                  <div className={`p-3 rounded-2xl text-sm font-bold text-center ${
                    formStatus.type === 'error' ? 'bg-rose-50 text-rose-600' : 
                    formStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {formStatus.message}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={formStatus.type === 'loading'}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                >
                  {formStatus.type === 'loading' ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </form>

              <p className="mt-6 text-[10px] text-gray-400 text-center leading-relaxed">
                باضافة كلمة مرور، ستتمكن من الدخول الى حسابك من اي جهاز باستخدام بريدك الالكتروني وكلمة المرور الجديدة، حتى لو سجلت الدخول أول مرة عبر جوجل.
              </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Hidden PDF Report Template */}
      <div id="pdf-report-template" style={{ display: 'none', width: '800px', padding: '40px', backgroundColor: 'white', direction: 'rtl', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginBottom: '10px' }}>تقرير مالي مفصل</h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>تاريخ التقرير: {format(new Date(), 'PPP', { locale: ar })}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '40px' }}>
          <div style={{ padding: '15px', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7' }}>
            <p style={{ fontSize: '12px', color: '#166534', marginBottom: '5px' }}>اجمالي الايرادات</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#15803D' }}>{totals.income.toLocaleString()} د.ك</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FEE2E2' }}>
            <p style={{ fontSize: '12px', color: '#991B1B', marginBottom: '5px' }}>اجمالي المصاريف</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#B91C1C' }}>{totals.expense.toLocaleString()} د.ك</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FEF3C7' }}>
            <p style={{ fontSize: '12px', color: '#92400E', marginBottom: '5px' }}>اجمالي العهدة</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#B45309' }}>{custodyTotal.toLocaleString()} د.ك</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: profitLoss >= 0 ? '#EFF6FF' : '#FFF7ED', borderRadius: '12px', border: profitLoss >= 0 ? '#DBEAFE' : '#FFEDD5' }}>
            <p style={{ fontSize: '12px', color: profitLoss >= 0 ? '#1E40AF' : '#9A3412', marginBottom: '5px' }}>صافي الربح/الخسارة</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: profitLoss >= 0 ? '#1D4ED8' : '#C2410C' }}>{profitLoss.toLocaleString()} د.ك</p>
          </div>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' }}>سجل العمليات</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', borderBottom: '1px solid #E5E7EB' }}>التاريخ</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', borderBottom: '1px solid #E5E7EB' }}>البيان</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', borderBottom: '1px solid #E5E7EB' }}>الفئة</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', borderBottom: '1px solid #E5E7EB' }}>المبلغ</th>
              <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', borderBottom: '1px solid #E5E7EB' }}>النوع</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactionsList.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '10px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold' }}>{format(tx.date.toDate(), 'HH:mm')}</span>
                    <span style={{ fontSize: '9px', opacity: 0.7 }}>{format(tx.date.toDate(), 'yyyy/MM/dd')}</span>
                  </div>
                </td>
                <td style={{ padding: '10px', fontSize: '11px' }}>{tx.description}</td>
                <td style={{ padding: '10px', fontSize: '11px' }}>{tx.category}</td>
                <td style={{ padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>{tx.amount.toLocaleString()} د.ك</td>
                <td style={{ padding: '10px', fontSize: '11px', color: tx.type === 'income' ? '#059669' : tx.type === 'expense' ? '#DC2626' : '#D97706' }}>
                  {tx.type === 'income' ? 'ايراد' : tx.type === 'expense' ? 'مصروف' : 'عهدة'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '10px', color: '#9CA3AF' }}>
          تم انشاء هذا التقرير آلياً بواسطة نظام ادارة العهدة والمصاريف
        </div>
      </div>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' :
              toast.type === 'error' ? 'bg-rose-600 text-white' :
              'bg-gray-900 text-white'
            }`}
          >
            {toast.type === 'success' && <ShieldCheck className="w-4 h-4" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {toast.type === 'info' && <History className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
