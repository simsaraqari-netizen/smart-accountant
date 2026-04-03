import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

export const UserManagementDashboard: React.FC = () => {
  const { isSuperAdmin, getAllUsers, addUser, updateUserRole, deleteUser } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');

  if (!isSuperAdmin) {
    return <div style={{ padding: '30px', textAlign: 'center', color: '#c33' }}><p>❌ لا توجد صلاحيات كافية</p></div>;
  }

  const users = getAllUsers();

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addUser(newUsername, newPassword, newRole);
    setMessage(result.message);
    if (result.success) {
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateRole = (username: string, role: 'admin' | 'user') => {
    const result = updateUserRole(username, role);
    setMessage(result.message);
    setEditingUser(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteUser = (username: string) => {
    if (confirm(`هل أنت متأكد من حذف ${username}؟`)) {
      const result = deleteUser(username);
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>📊 إدارة المستخدمين</h2>

      {message && <div style={{ padding: '12px', borderRadius: '6px', marginBottom: '20px', background: message.includes('✅') ? '#efe' : '#fee', color: message.includes('✅') ? '#3c3' : '#c33', border: `1px solid ${message.includes('✅') ? '#3c3' : '#c33'}` }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <h3>➕ إضافة مستخدم جديد</h3>
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="اسم المستخدم" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            <input type="password" placeholder="كلمة المرور" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
              <option value="user">مستخدم عادي</option>
              <option value="admin">مسؤول</option>
            </select>
            <button type="submit" style={{ padding: '10px', background: 'linear-gradient(135deg, #1b3a6b 0%, #f07820 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>إضافة المستخدم</button>
          </form>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <h3>👥 قائمة المستخدمين ({users.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflow: 'auto' }}>
            {users.map((user) => (
              <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #eee' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>{user.username}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{user.role === 'super_admin' ? '👑 مدير النظام' : user.role === 'admin' ? '👤 مسؤول' : '👥 مستخدم'}</p>
                </div>
                {user.role !== 'super_admin' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {editingUser === user.username ? (
                      <>
                        <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')} style={{ padding: '6px', fontSize: '12px' }}>
                          <option value="user">مستخدم</option>
                          <option value="admin">مسؤول</option>
                        </select>
                        <button onClick={() => handleUpdateRole(user.username, newUserRole)} style={{ padding: '6px 12px', background: '#3c3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✓</button>
                        <button onClick={() => setEditingUser(null)} style={{ padding: '6px 12px', background: '#ddd', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingUser(user.username); setNewUserRole(user.role as 'admin' | 'user'); }} style={{ padding: '6px 12px', background: '#08f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️ تعديل</button>
                        <button onClick={() => handleDeleteUser(user.username)} style={{ padding: '6px 12px', background: '#c33', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️ حذف</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
