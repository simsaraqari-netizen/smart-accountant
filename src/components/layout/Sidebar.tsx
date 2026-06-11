import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  PlusCircle, 
  LayoutDashboard, 
  History, 
  Coins, 
  Bell, 
  UserCircle, 
  RefreshCw, 
  Settings, 
  Users, 
  LogOut, 
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  PieChartIcon
} from 'lucide-react';
import { FormattedNumber } from '../common/FormattedNumber';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onAddTransaction: () => void;
  onShowReminders: () => void;
  onShowAccount: () => void;
  onShowSettings: () => void;
  onShowCategories: () => void;
  onShowUserManagement: () => void;
  onShowPersonsModal: () => void;
  onLogout: () => void;
  totals: { income: number; expense: number };
  custodyTotal: number;
  profitLoss: number;
}

export const Sidebar = ({
  isOpen,
  onClose,
  userRole,
  activeTab,
  setActiveTab,
  onAddTransaction,
  onShowReminders,
  onShowAccount,
  onShowSettings,
  onShowCategories,
  onShowUserManagement,
  onShowPersonsModal,
  onLogout,
  totals,
  custodyTotal,
  profitLoss
}: SidebarProps) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-[var(--color-ios-background)] z-[70] shadow-2xl p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="ios-large-title !text-2xl">القائمة</h2>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors active:scale-90">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              {userRole === 'admin' && (
                <button 
                  onClick={() => { onAddTransaction(); onClose(); }}
                  className="ios-button-primary w-full flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
                >
                  <PlusCircle className="w-5 h-5" />
                  إضافة عملية جديدة
                </button>
              )}

              <div className="space-y-2">
                <p className="ios-section-title">الملخص المالي</p>
                <div className="ios-list-group">
                  <button 
                    onClick={() => { setActiveTab('transactions'); onClose(); }}
                    className="ios-list-item w-full"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="font-bold text-sm text-gray-700 flex-1 text-right">الإيرادات</span>
                      <span className="font-black text-sm text-emerald-700"><FormattedNumber value={totals.income} /></span>
                    </div>
                  </button>
                  <button 
                    onClick={() => { setActiveTab('transactions'); onClose(); }}
                    className="ios-list-item w-full border-t border-black/5"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="w-5 h-5 text-rose-600" />
                      </div>
                      <span className="font-bold text-sm text-gray-700 flex-1 text-right">المصاريف</span>
                      <span className="font-black text-sm text-rose-700"><FormattedNumber value={totals.expense} /></span>
                    </div>
                  </button>
                  <button 
                    onClick={() => { setActiveTab('custody'); onClose(); }}
                    className="ios-list-item w-full border-t border-black/5"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Coins className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="font-bold text-sm text-gray-700 flex-1 text-right">العهدة</span>
                      <span className="font-black text-sm text-amber-700"><FormattedNumber value={custodyTotal} /></span>
                    </div>
                  </button>
                  <div className="ios-list-item w-full border-t border-black/5">
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-8 h-8 rounded-full ${profitLoss >= 0 ? 'bg-blue-100' : 'bg-orange-100'} flex items-center justify-center shrink-0`}>
                        <PieChartIcon className={`w-5 h-5 ${profitLoss >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                      </div>
                      <span className="font-bold text-sm text-gray-700 flex-1 text-right">الصافي</span>
                      <span className={`font-black text-sm ${profitLoss >= 0 ? 'text-blue-700' : 'text-orange-700'}`}><FormattedNumber value={profitLoss} /></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="ios-section-title">الرئيسية</p>
                <div className="ios-list-group">
                  <button 
                    onClick={() => { setActiveTab('dashboard'); onClose(); }}
                    className={`ios-list-item w-full ${activeTab === 'dashboard' ? 'bg-blue-50 text-[var(--color-ios-blue)]' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-5 h-5" />
                      <span className="font-bold text-sm">لوحة التحكم</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 opacity-30" />
                  </button>
                  <button 
                    onClick={() => { setActiveTab('transactions'); onClose(); }}
                    className={`ios-list-item w-full ${activeTab === 'transactions' ? 'bg-blue-50 text-[var(--color-ios-blue)]' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <History className="w-5 h-5" />
                      <span className="font-bold text-sm">العمليات</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 opacity-30" />
                  </button>
                  <button 
                    onClick={() => { setActiveTab('custody'); onClose(); }}
                    className={`ios-list-item w-full ${activeTab === 'custody' ? 'bg-blue-50 text-[var(--color-ios-blue)]' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Coins className="w-5 h-5" />
                      <span className="font-bold text-sm">إدارة العهدة</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 opacity-30" />
                  </button>
                  <button 
                    onClick={() => { setActiveTab('persons'); onClose(); }}
                    className={`ios-list-item w-full ${activeTab === 'persons' ? 'bg-blue-50 text-[var(--color-ios-blue)]' : 'text-gray-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5" />
                      <span className="font-bold text-sm">لوحة الموظفين</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 opacity-30" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="ios-section-title">الأدوات</p>
                <div className="ios-list-group">
                  <button 
                    onClick={() => { onShowReminders(); onClose(); }}
                    className="ios-list-item w-full text-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5" />
                      <span className="font-bold text-sm">التذكيرات</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 opacity-30" />
                  </button>
                  <button 
                    onClick={() => { onShowAccount(); onClose(); }}
                    className="ios-list-item w-full text-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-5 h-5" />
                      <span className="font-bold text-sm">إدارة الحساب</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 opacity-30" />
                  </button>
                </div>
              </div>

              {userRole === 'admin' && (
                <div className="space-y-2">
                  <p className="ios-section-title">الإدارة</p>
                  <div className="ios-list-group">
                    <button 
                      onClick={() => { onShowSettings(); onClose(); }}
                      className="ios-list-item w-full text-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5" />
                        <span className="font-bold text-sm">إعدادات المزامنة</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 opacity-30" />
                    </button>
                    <button 
                      onClick={() => { onShowCategories(); onClose(); }}
                      className="ios-list-item w-full text-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5" />
                        <span className="font-bold text-sm">إدارة الفئات</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 opacity-30" />
                    </button>
                    <button 
                      onClick={() => { onShowPersonsModal(); onClose(); }}
                      className="ios-list-item w-full text-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" />
                        <span className="font-bold text-sm">إدارة الموظفين</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 opacity-30" />
                    </button>
                    <button 
                      onClick={() => { onShowUserManagement(); onClose(); }}
                      className="ios-list-item w-full text-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" />
                        <span className="font-bold text-sm">إدارة المستخدمين</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 opacity-30" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-black/5">
              <button 
                onClick={onLogout}
                className="ios-list-item w-full text-rose-600 hover:bg-rose-50"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold text-sm">تسجيل الخروج</span>
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
