import React from 'react';
import { User } from 'firebase/auth';
import { ReceiptText, PlusCircle } from 'lucide-react';

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

interface NavbarProps {
  user: User;
  userRole: string | null;
  onAddTransaction: () => void;
  onToggleDrawer: () => void;
  onGoHome: () => void;
}

export const Navbar = ({ 
  user, 
  userRole, 
  onAddTransaction, 
  onToggleDrawer, 
  onGoHome 
}: NavbarProps) => (
  <nav className="ios-glass border-b border-white/20 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <button 
        onClick={onToggleDrawer}
        className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-900 active:scale-90"
      >
        <CustomMenuIcon className="w-8 h-8" />
      </button>
      <div 
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onGoHome}
      >
        <div className="bg-[var(--color-ios-blue)] p-2 rounded-full shadow-lg shadow-blue-500/20">
          <ReceiptText className="text-white w-6 h-6" />
        </div>
        <h1 className="ios-large-title !text-xl">المحاسب الذكي</h1>
      </div>
    </div>
    <div className="flex-1 h-full cursor-pointer self-stretch" onClick={onGoHome}></div>
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-semibold text-gray-900">{user.displayName}</p>
        <p className="text-xs text-gray-400 font-medium">{user.email}</p>
      </div>
      {userRole === 'admin' && (
        <button 
          onClick={onAddTransaction}
          className="w-10 h-10 rounded-full bg-[var(--color-ios-blue)] text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-90 shadow-lg shadow-blue-500/30"
          title="اضافة عملية"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  </nav>
);
