import { useState } from 'react'
import { useAuth } from './auth/AuthContext'
import { LoginPage } from './components/pages/LoginPage'
import './App.css'

function App() {
  const { isLoggedIn, currentUser, logout } = useAuth()

  if (!isLoggedIn) {
    return <LoginPage />
  }

  return (
    <>
      <nav style={{ background: 'linear-gradient(135deg, #1b3a6b 0%, #f07820 100%)', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 700 }}>📊 المحاسب الذكي</div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0', fontSize: '14px', fontWeight: 700, color: 'white' }}>{currentUser?.username}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>{currentUser?.role === 'super_admin' ? '👑 مدير النظام' : '👥 مستخدم'}</p>
          </div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>🚪 خروج</button>
        </div>
      </nav>
      <main style={{ minHeight: 'calc(100vh - 70px)', background: '#f5f5f5', padding: '40px 30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h1 style={{ color: '#1b3a6b', fontSize: '36px', margin: '0 0 15px 0' }}>🎉 مرحباً بك في المحاسب الذكي</h1>
          <p style={{ color: '#666', fontSize: '18px', margin: '0 0 30px 0' }}>نظام إدارة الحسابات المتقدم</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
            <div style={{ background: 'linear-gradient(135deg, #1b3a6b 0%, #2d5a9e 100%)', color: 'white', padding: '20px', borderRadius: '8px' }}>
              <p style={{ fontSize: '24px', margin: '0 0 10px 0' }}>👤</p>
              <h3 style={{ margin: '0 0 10px 0' }}>بيانات المستخدم</h3>
              <p style={{ margin: 0, fontSize: '14px' }}><strong>{currentUser?.username}</strong></p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f07820 0%, #ff9d48 100%)', color: 'white', padding: '20px', borderRadius: '8px' }}>
              <p style={{ fontSize: '24px', margin: '0 0 10px 0' }}>🔐</p>
              <h3 style={{ margin: '0 0 10px 0' }}>مستوى الصلاحيات</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>{currentUser?.role === 'super_admin' ? '👑 مدير النظام' : '👥 مستخدم عادي'}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default App
