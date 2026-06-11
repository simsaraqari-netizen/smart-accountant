import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trash2, Pencil, Check, X } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  userRole: string | null;
  newCategory: { name: string; type: 'income' | 'expense' };
  setNewCategory: (cat: any) => void;
  onAddCategory: (e: React.FormEvent) => void;
  onDeleteCategory: (cat: any) => void;
  onUpdateCategoryType?: (categoryId: string, newType: 'income' | 'expense') => void;
  onUpdateCategoryName?: (categoryId: string, newName: string, newType: 'income' | 'expense', budgetLimit?: number) => void;
}

export const CategoryModal = ({
  isOpen,
  onClose,
  categories,
  userRole,
  newCategory,
  setNewCategory,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategoryType,
  onUpdateCategoryName,
}: CategoryModalProps) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');

  const [editBudgetLimit, setEditBudgetLimit] = useState<string>('');

  const startEdit = (cat: any) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditType(cat.type);
    setEditBudgetLimit(cat.budgetLimit ? cat.budgetLimit.toString() : '');
  };

  const cancelEdit = () => {
    setEditingCatId(null);
    setEditName('');
  };

  const saveEdit = (cat: any) => {
    if (!editName.trim()) return;
    if (onUpdateCategoryName) {
      onUpdateCategoryName(cat.id, editName.trim(), editType, editBudgetLimit ? Number(editBudgetLimit) : undefined);
    } else if (onUpdateCategoryType && editType !== cat.type) {
      onUpdateCategoryType(cat.id, editType);
    }
    setEditingCatId(null);
  };

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
              <h3 className="text-lg font-black text-emerald-600">ادارة الفئات</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">الفئات الحالية</h4>
                <div className="grid grid-cols-1 gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                      
                      {editingCatId === cat.id ? (
                        /* --- Edit Mode --- */
                        <div className="p-3 space-y-3">
                          {/* Name Input */}
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                            className="w-full bg-white border-2 border-emerald-300 rounded-xl p-2 text-sm font-bold text-right focus:outline-none focus:border-emerald-500"
                            placeholder="اسم الفئة..."
                          />

                          {/* Type toggle */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setEditType('expense')}
                              className={`p-2 rounded-xl border-2 font-bold text-xs transition-all ${editType === 'expense' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                            >
                              🔴 مصروف
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditType('income')}
                              className={`p-2 rounded-xl border-2 font-bold text-xs transition-all ${editType === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                            >
                              🟢 ايراد
                            </button>
                          </div>

                          {editType === 'expense' && (
                            <div className="mt-2">
                              <input
                                type="number"
                                placeholder="الميزانية التقديرية (اختياري)"
                                value={editBudgetLimit}
                                onChange={(e) => setEditBudgetLimit(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:border-emerald-500 outline-none transition-colors"
                              />
                            </div>
                          )}

                          {/* Save / Cancel */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(cat)}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
                            >
                              <Check className="w-4 h-4" /> حفظ
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                              <X className="w-4 h-4" /> إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* --- View Mode --- */
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2 flex-grow min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cat.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            <span className="text-sm font-bold text-gray-900 truncate">{cat.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                              cat.type === 'income' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-rose-50 text-rose-600'
                            }`}>
                              {cat.type === 'income' ? 'ايراد' : 'مصروف'}
                            </span>
                          </div>
                          {userRole === 'admin' && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => startEdit(cat)}
                                className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-2xl transition-colors"
                                title="تعديل"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteCategory(cat)}
                                className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-2xl transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {userRole === 'admin' && (
                <form onSubmit={onAddCategory} className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">اضافة فئة جديدة</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                      className={`p-2 rounded-2xl border-2 font-bold text-xs transition-all ${newCategory.type === 'expense' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                      مصروف
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                      className={`p-2 rounded-2xl border-2 font-bold text-xs transition-all ${newCategory.type === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                      ايراد
                    </button>
                  </div>
                  <input 
                    type="text" 
                    required
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 text-sm font-bold text-right focus:ring-2 focus:ring-emerald-500 transition-all outline-none shadow-sm"
                    placeholder="اسم الفئة الجديدة..."
                  />
                  <button 
                    type="submit"
                    className="w-full bg-gray-900 text-white py-3 rounded-2xl font-black text-sm hover:bg-gray-800 transition-all"
                  >
                    اضافة الفئة
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
