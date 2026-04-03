import { useState } from 'react'
import { useAuth } from './auth/AuthContext'
import { LoginPage } from './components/pages/LoginPage'
import { UpdatedNavbar } from './components/layout/UpdatedNavbar'
import './App.css'

function App() {
  const { isLoggedIn, currentUser } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')

  if (!isLoggedIn) {
    return <LoginPage />
  }

  return (
    <>
      <UpdatedNavbar onNavigate={setCurrentPage} currentPage={currentPage} />
      <main style={{ minHeight: 'calc(100vh - 70px)', background: '#f5f5f5' }}>
        {currentPage === 'home' && (
          <div style={{ padding: '40px 30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
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
                  <p style={{ margin: 0, fontSize: '14px' }}>{currentUser?.role === 'super_admin' ? '👑 مدير النظام الكامل' : '👥 مستخدم عادي'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export default App
