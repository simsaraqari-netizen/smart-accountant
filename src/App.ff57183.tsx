import { useState } from 'react'
import { useAuth } from './auth/AuthContext'
import './App.css'

function App() {
  const { isLoggedIn, currentUser, logout } = useAuth()

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1b3a6b 0%, #f07820 100%)' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ color: '#1b3a6b' }}>المحاسب الذكي</h1>
          <p style={{ color: '#666' }}>جاري تحميل صفحة تسجيل الدخول...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <nav style={{ background: 'linear-gradient(135deg, #1b3a6b 0%, #f07820 100%)', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📊 المحاسب الذكي</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>{currentUser?.username} ({currentUser?.role})</span>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>خروج</button>
        </div>
      </nav>
      <main style={{ padding: '30px', textAlign: 'center' }}>
        <h2>مرحباً بك في المحاسب الذكي! 👋</h2>
        <p style={{ color: '#666', fontSize: '16px' }}>نظام إدارة الحسابات المتقدم</p>
        <p>المستخدم: <strong>{currentUser?.username}</strong></p>
        <p>الصلاحيات: <strong>{currentUser?.role === 'super_admin' ? '👑 مدير النظام' : currentUser?.role === 'admin' ? '👤 مسؤول عادي' : '👥 مستخدم عادي'}</strong></p>
      </main>
    </div>
  )
}

export default App
