import React from 'react';
import { useAuth } from '../../auth/AuthContext';

interface NavbarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export const UpdatedNavbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { currentUser, isSuperAdmin, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout();
    }
  };

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <nav style={{ background: 'linear-gradient(135deg, #1b3a6b 0%, #f07820 100%)', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '30px' }}>
      <div style={{ fontSize: '24px', fontWeight: 700 }}>📊 المحاسب الذكي</div>

      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        {isSuperAdmin && (
          <button
            onClick={() => handleNavigation('dashboard')}
            style={{
              background: 'none',
              border: 'none',
              color: currentPage === 'dashboard' ? 'white' : 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              backgroundColor: currentPage === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
          >
            🛠️ إدارة المستخدمين
          </button>
        )}
        <button
          onClick={() => handleNavigation('home')}
          style={{
            background: 'none',
            border: 'none',
            color: currentPage === 'home' ? 'white' : 'rgba(255,255,255,0.8)',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            backgroundColor: currentPage === 'home' ? 'rgba(255,255,255,0.2)' : 'transparent',
          }}
        >
          🏠 الرئيسية
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', paddingRight: '20px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0', fontSize: '14px', fontWeight: 700, color: 'white' }}>{currentUser?.username}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
            {currentUser?.role === 'super_admin' ? '👑 مدير النظام' : currentUser?.role === 'admin' ? '👤 مسؤول عادي' : '👥 مستخدم عادي'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
          }}
        >
          🚪 خروج
        </button>
      </div>
    </nav>
  );
};
