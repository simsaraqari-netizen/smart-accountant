import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  UserPlus, 
  Users, 
  ShieldCheck, 
  UserCircle, 
  Edit2, 
  Trash2 
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  newUserForm: any;
  setNewUserForm: (form: any) => void;
  handleCreateUser: (e: React.FormEvent) => void;
  formStatus: { type: string; message: string };
  allUsers: any[];
  editingUser: any | null;
  setEditingUser: (user: any | null) => void;
  editUserForm: any;
  setEditUserForm: (form: any) => void;
  handleEditUserSubmit: (e: React.FormEvent) => void;
  handleUpdateUserRole: (userId: string, role: 'admin' | 'user') => void;
  handleDeleteUser: (userId: string) => void;
  currentUser: any;
}

export const UserManagementModal = ({
  isOpen,
  onClose,
  newUserForm,
  setNewUserForm,
  handleCreateUser,
  formStatus,
  allUsers,
  editingUser,
  setEditingUser,
  editUserForm,
  setEditUserForm,
  handleEditUserSubmit,
  handleUpdateUserRole,
  handleDeleteUser,
  currentUser
}: UserManagementModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              <h3 className="text-lg font-black text-emerald-600">إدارة المستخدمين</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Add New User Form */}
              <form onSubmit={handleCreateUser} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-black text-gray-900">إضافة مستخدم جديد</h4>
                </div>
                
                {formStatus.message && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${formStatus.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {formStatus.message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">اسم المستخدم أو البريد</label>
                    <input 
                      type="text" 
                      required
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-sm font-bold text-right focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm"
                      placeholder="اسم أو رقم أو بريد"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">كلمة المرور</label>
                    <input 
                      type="password" 
                      required
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-sm font-bold text-right focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">الصلاحيات</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setNewUserForm({ ...newUserForm, role: 'user' })}
                      className={`p-2 rounded-xl border-2 font-bold text-xs transition-all ${newUserForm.role === 'user' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                      مستخدم عادي
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewUserForm({ ...newUserForm, role: 'admin' })}
                      className={`p-2 rounded-xl border-2 font-bold text-xs transition-all ${newUserForm.role === 'admin' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                      مدير (Admin)
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={formStatus.type === 'loading'}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-black text-sm hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {formStatus.type === 'loading' ? 'جاري الحفظ...' : 'إنشاء الحساب'}
                </button>
              </form>

              {/* Users List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-black text-gray-900">المستخدمين المسجلين</h4>
                </div>
                
                <div className="space-y-2">
                  {allUsers.map(u => (
                    <div key={u.id} className="flex flex-col p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      {editingUser?.id === u.id ? (
                        <form onSubmit={handleEditUserSubmit} className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Edit2 className="w-4 h-4 text-blue-600" />
                            <h5 className="text-xs font-bold text-gray-700">تعديل بيانات المستخدم</h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input 
                              type="text"
                              value={editUserForm.username}
                              onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                              className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-lg p-2 text-xs font-bold text-right focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                              placeholder="اسم المستخدم الجديد"
                            />
                            <input 
                              type="password"
                              value={editUserForm.password}
                              onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                              className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-lg p-2 text-xs font-bold text-right focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                              placeholder="كلمة المرور الجديدة (اختياري)"
                            />
                          </div>
                          <div className="flex gap-2 justify-end mt-2">
                            <button 
                              type="button"
                              onClick={() => setEditingUser(null)}
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200"
                            >
                              إلغاء
                            </button>
                            <button 
                              type="submit"
                              disabled={formStatus.type === 'loading'}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                            >
                              {formStatus.type === 'loading' ? 'جاري الحفظ...' : 'حفظ'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                              {u.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{u.username || u.email}</p>
                              <p className="text-[10px] text-gray-500">{u.role === 'admin' ? 'مدير النظام' : 'مستخدم'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {u.id !== currentUser?.uid && (
                              <>
                                <select 
                                  value={u.role}
                                  onChange={(e) => handleUpdateUserRole(u.id, e.target.value as 'admin' | 'user')}
                                  className="text-[10px] font-bold bg-white/40 backdrop-blur-md border border-white/20 rounded-lg p-1.5 text-right focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
                                >
                                  <option value="user">مستخدم</option>
                                  <option value="admin">مدير</option>
                                </select>
                                <button 
                                  onClick={() => {
                                    setEditingUser(u);
                                    setEditUserForm({ username: u.username || u.email, password: '' });
                                  }}
                                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {u.id === currentUser?.uid && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">انت</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
