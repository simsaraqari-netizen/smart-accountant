import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trash2 } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  userRole: string | null;
  newCategory: { name: string; type: 'income' | 'expense' };
  setNewCategory: (cat: any) => void;
  onAddCategory: (e: React.FormEvent) => void;
  onDeleteCategory: (cat: any) => void;
}

export const CategoryModal = ({
  isOpen,
  onClose,
  categories,
  userRole,
  newCategory,
  setNewCategory,
  onAddCategory,
  onDeleteCategory
}: CategoryModalProps) => {
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
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">الفئات الحالية</h4>
                <div className="grid grid-cols-1 gap-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cat.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span className="text-sm font-bold text-gray-900">{cat.name}</span>
                        <span className="text-[10px] text-gray-400">({cat.type === 'income' ? 'ايراد' : 'مصروف'})</span>
                      </div>
                      {userRole === 'admin' && (
                        <button 
                          onClick={() => onDeleteCategory(cat)}
                          className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-2xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
