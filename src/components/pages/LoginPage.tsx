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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1b3a6b 0%, #f07820 100%)', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxWidth: '450px', width: '100%', padding: '40px 30px', direction: 'rtl' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#1b3a6b', fontSize: '32px', margin: '0 0 10px 0', fontWeight: 700 }}>المحاسب الذكي</h1>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>نظام إدارة الحسابات المتقدم</p>
        </div>

        <form onSubmit={handleLogin} style={{ marginBottom: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#333', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>اسم المستخدم</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="أدخل اسم المستخدم" disabled={isLoading} autoFocus style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#333', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" disabled={isLoading} style={{ width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          {error && <div style={{ background: '#fee', color: '#c33', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', borderRight: '4px solid #c33' }}>{error}</div>}

          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #1b3a6b 0%, #f07820 100%)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>{isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}</button>
        </form>

        <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '15px', border: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '14px', fontWeight: 600 }}>البيانات التجريبية:</h3>
          <div><div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: '#e3f2fd', color: '#1b3a6b', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>مسؤول</span><div style={{ fontSize: '12px' }}><p style={{ margin: '2px 0', color: '#555' }}><strong>اسم:</strong> مدير النظام</p><p style={{ margin: '2px 0', color: '#555' }}><strong>كلمة المرور:</strong> 65814909</p></div></div><div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: '#fff3e0', color: '#f07820', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>مستخدم</span><div style={{ fontSize: '12px' }}><p style={{ margin: '2px 0', color: '#555' }}><strong>اسم:</strong> ابوابرهيم</p><p style={{ margin: '2px 0', color: '#555' }}><strong>كلمة المرور:</strong> 12345678</p></div></div></div>
        </div>
      </div>
    </div>
  );
};
