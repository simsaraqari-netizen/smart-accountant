import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Coins, 
  Users, 
  Calendar, 
  FileText, 
  Plus,
  Trash2
} from 'lucide-react';
import { FormattedNumber } from '../common/FormattedNumber';
import { CollapsibleSection } from '../common/CollapsibleSection';

interface TransactionModalProps {
  mode: 'add' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  setTransaction: (tx: any) => void;
  formStatus: { type: string; message: string };
  categories: any[];
  persons: any[];
  custodyAccounts: any[];
  onSubmit: (e: React.FormEvent) => void;
}

export const TransactionModal = ({
  mode,
  isOpen,
  onClose,
  transaction,
  setTransaction,
  formStatus,
  categories,
  persons,
  custodyAccounts,
  onSubmit
}: TransactionModalProps) => {
  const isAdd = mode === 'add';

  const handleSplitChange = (index: number, field: string, value: any) => {
    const newSplits = [...(transaction.splits || [])];
    newSplits[index] = { ...newSplits[index], [field]: value };
    
    // Auto-calculate amount if percentage changes
    if (field === 'percentage' && transaction.amount) {
      newSplits[index].amount = (parseFloat(transaction.amount) * value) / 100;
    }
    
    setTransaction({ ...transaction, splits: newSplits });
  };

  const addSplit = () => {
    const currentSplits = transaction.splits || [];
    setTransaction({
      ...transaction,
      splits: [...currentSplits, { personName: '', percentage: 0, amount: 0 }]
    });
  };

  const removeSplit = (index: number) => {
    const newSplits = transaction.splits.filter((_: any, i: number) => i !== index);
    setTransaction({ ...transaction, splits: newSplits });
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
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="w-10"></div>
              <div className="text-center">
                <h3 className={`text-xl font-black ${isAdd ? 'text-emerald-700' : 'text-blue-700'} tracking-tight`}>
                  {isAdd ? 'إضافة عملية جديدة' : 'تعديل العملية'}
                </h3>
                <p className={`text-[10px] font-bold ${isAdd ? 'text-emerald-600/60' : 'text-blue-600/60'} uppercase tracking-widest mt-1`}>
                  {isAdd ? 'تسجيل معاملة مالية جديدة' : 'تحديث بيانات المعاملة المالية'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-500 transition-all duration-300 active:scale-90">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
              {formStatus.message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-[0.75rem] text-sm font-bold flex items-center gap-3 ${
                    formStatus.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                    formStatus.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    formStatus.type === 'error' ? 'bg-rose-500' : 
                    formStatus.type === 'success' ? 'bg-emerald-500' : 
                    'bg-blue-500'
                  }`}></div>
                  {formStatus.message}
                </motion.div>
              )}

              {/* Amount and Type Section */}
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
                <div className="text-center mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المبلغ والنوع</span>
                </div>
                
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.001"
                    required
                    value={transaction.amount}
                    onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
                    className="w-full bg-white border-2 border-gray-100 rounded-2xl p-5 text-3xl font-black text-center text-gray-900 focus:border-blue-500 transition-all outline-none placeholder:text-gray-200"
                    placeholder="0.000"
                    autoFocus
                  />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300 text-lg">د.ك</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setTransaction({ ...transaction, type: 'expense' })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 font-black text-sm ${
                      transaction.type === 'expense' 
                        ? 'bg-rose-50 border-rose-500 text-rose-600 shadow-lg shadow-rose-100' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <ArrowDownLeft className="w-5 h-5" />
                    مصروف
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTransaction({ ...transaction, type: 'income' })}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 font-black text-sm ${
                      transaction.type === 'income' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-100' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    إيراد
                  </button>
                </div>
              </div>

              {/* Basic Info Section */}
              <CollapsibleSection title="المعلومات الأساسية" icon={FileText} defaultExpanded={true} isActive={true} color="blue">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-1 tracking-widest uppercase">الفئة</label>
                    <div className="relative">
                      <select 
                        required
                        value={transaction.category}
                        onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-right focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="">اختر الفئة...</option>
                        {categories.filter(c => c.type === transaction.type || c.type === 'all').map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-1 tracking-widest uppercase">الشخص</label>
                    <input 
                      type="text" 
                      list="persons-list"
                      value={transaction.personName}
                      onChange={(e) => setTransaction({ ...transaction, personName: e.target.value })}
                      className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-right focus:border-blue-500 transition-all outline-none"
                      placeholder="اسم الشخص (اختياري)..."
                    />
                    <datalist id="persons-list">
                      {persons.map(p => <option key={p.id} value={p.name} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-1 tracking-widest uppercase">التاريخ</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        required
                        value={isAdd ? transaction.date : (transaction.date?.toDate ? transaction.date.toDate().toISOString().split('T')[0] : transaction.date)}
                        onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
                        className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-right focus:border-blue-500 transition-all outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-1 tracking-widest uppercase">الوصف</label>
                    <textarea 
                      value={transaction.description}
                      onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
                      rows={2}
                      className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 text-sm font-bold text-right focus:border-blue-500 transition-all outline-none resize-none"
                      placeholder="ملاحظات إضافية..."
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Custody Linking Section */}
              <CollapsibleSection 
                title="الربط بعهدة مالية" 
                icon={Coins} 
                isActive={transaction.isCustodyLinked} 
                color="blue"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-xs font-bold text-blue-700">تفعيل الربط بالعهدة</span>
                    <button 
                      type="button"
                      onClick={() => setTransaction({ ...transaction, isCustodyLinked: !transaction.isCustodyLinked })}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${transaction.isCustodyLinked ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${transaction.isCustodyLinked ? 'right-7' : 'right-1'}`}></div>
                    </button>
                  </div>

                  {transaction.isCustodyLinked && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-2"
                    >
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 mb-1 tracking-widest uppercase">حساب العهدة</label>
                        <select 
                          required={transaction.isCustodyLinked}
                          value={transaction.custodyAccountId}
                          onChange={(e) => setTransaction({ ...transaction, custodyAccountId: e.target.value })}
                          className="w-full bg-white border-2 border-blue-100 rounded-xl p-3 text-sm font-bold text-right focus:border-blue-500 transition-all outline-none"
                        >
                          <option value="">اختر الحساب...</option>
                          {custodyAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name} (الرصيد: {acc.balance.toLocaleString('en-US')})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button"
                          onClick={() => setTransaction({ ...transaction, custodyType: 'custody_out' })}
                          className={`p-3 rounded-lg border-2 font-black text-[10px] transition-all ${
                            transaction.custodyType === 'custody_out' 
                              ? 'bg-rose-50 border-rose-500 text-rose-600' 
                              : 'bg-white border-gray-100 text-gray-400'
                          }`}
                        >
                          خصم من العهدة
                        </button>
                        <button 
                          type="button"
                          onClick={() => setTransaction({ ...transaction, custodyType: 'custody_in' })}
                          className={`p-3 rounded-lg border-2 font-black text-[10px] transition-all ${
                            transaction.custodyType === 'custody_in' 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                              : 'bg-white border-gray-100 text-gray-400'
                          }`}
                        >
                          إضافة للعهدة
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 mb-1 tracking-widest uppercase">مبلغ العهدة</label>
                        <input 
                          type="number" 
                          step="0.001"
                          required={transaction.isCustodyLinked}
                          value={transaction.custodyAmount}
                          onChange={(e) => setTransaction({ ...transaction, custodyAmount: e.target.value })}
                          className="w-full bg-white border-2 border-blue-100 rounded-xl p-3 text-sm font-bold text-right focus:border-blue-500 transition-all outline-none"
                          placeholder="اتركه فارغاً ليساوي مبلغ العملية"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </CollapsibleSection>

              {/* Split Section */}
              <CollapsibleSection 
                title="تقسيم المبالغ" 
                icon={Users} 
                isActive={transaction.splits && transaction.splits.length > 0} 
                color="blue"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-bold text-gray-400">تقسيم العملية على عدة أشخاص</p>
                    <button 
                      type="button"
                      onClick={addSplit}
                      className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 hover:bg-blue-100 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      إضافة قسم
                    </button>
                  </div>

                  <div className="space-y-3">
                    {transaction.splits?.map((split: any, index: number) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3 relative group"
                      >
                        <button 
                          type="button"
                          onClick={() => removeSplit(index)}
                          className="absolute -left-2 -top-2 w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-black text-gray-400 mb-1 tracking-widest uppercase">الشخص</label>
                            <input 
                              type="text" 
                              list="persons-list"
                              required
                              value={split.personName}
                              onChange={(e) => handleSplitChange(index, 'personName', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-right outline-none focus:border-blue-400"
                              placeholder="اسم الشخص..."
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black text-gray-400 mb-1 tracking-widest uppercase">النسبة (%)</label>
                            <input 
                              type="number" 
                              required
                              value={split.percentage}
                              onChange={(e) => handleSplitChange(index, 'percentage', parseFloat(e.target.value))}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-right outline-none focus:border-blue-400"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[8px] font-black text-gray-400 mb-1 tracking-widest uppercase">المبلغ</label>
                          <input 
                            type="number" 
                            step="0.001"
                            required
                            value={split.amount}
                            onChange={(e) => handleSplitChange(index, 'amount', parseFloat(e.target.value))}
                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-bold text-right outline-none focus:border-blue-400"
                            placeholder="0.000"
                          />
                        </div>
                      </motion.div>
                    ))}

                    {transaction.splits?.length > 0 && (
                      <div className="pt-2 border-t border-gray-100 flex justify-between items-center px-1">
                        <span className="text-[10px] font-bold text-gray-400">إجمالي التقسيم:</span>
                        <span className={`text-xs font-black ${
                          Math.abs(transaction.splits.reduce((sum: number, s: any) => sum + s.percentage, 0) - 100) < 0.01 
                            ? 'text-emerald-600' 
                            : 'text-rose-600'
                        }`}>
                          {transaction.splits.reduce((sum: number, s: any) => sum + s.percentage, 0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleSection>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={formStatus.type === 'loading'}
                  className={`w-full py-4 rounded-2xl font-black text-base shadow-xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] ${
                    isAdd 
                      ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' 
                      : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
                  }`}
                >
                  {formStatus.type === 'loading' ? 'جاري الحفظ...' : (isAdd ? 'تسجيل العملية' : 'تحديث العملية')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
