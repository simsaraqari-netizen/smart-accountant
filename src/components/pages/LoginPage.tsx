import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

      const success = login(username, password, rememberMe);
      if (!success) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="login-page" dir="rtl">
      {/* Background decoration */}
      <div className="login-bg-decoration">
        <div className="login-circle login-circle-1"></div>
        <div className="login-circle login-circle-2"></div>
        <div className="login-circle login-circle-3"></div>
      </div>

      <div className="login-card">
        {/* Logo / Header */}
        <div className="login-header">
          <div className="login-logo">📊</div>
          <h1 className="login-title">المحاسب الذكي</h1>
          <p className="login-subtitle">نظام إدارة الحسابات المتقدم</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {/* Username */}
          <div className="login-field">
            <label className="login-label">اسم المستخدم</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">👤</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                disabled={isLoading}
                autoFocus
                className="login-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label className="login-label">كلمة المرور</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                disabled={isLoading}
                className="login-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-eye-btn"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="login-remember">
            <label className="login-checkbox-label">
              <div
                className={`login-checkbox ${rememberMe ? 'login-checkbox-checked' : ''}`}
                onClick={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && <span className="login-checkbox-tick">✓</span>}
              </div>
              <span className="login-checkbox-text">تذكرني عند الدخول</span>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={isLoading} className="login-btn">
            {isLoading ? (
              <span className="login-loading">
                <span className="login-spinner"></span>
                جاري التحقق...
              </span>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        {/* Hint */}
        <p className="login-hint">
          {rememberMe
            ? '✅ سيتم تذكرك تلقائياً في المرات القادمة'
            : '🔑 ستحتاج لتسجيل الدخول مجدداً عند إغلاق المتصفح'}
        </p>
      </div>
    </div>
  );
};
