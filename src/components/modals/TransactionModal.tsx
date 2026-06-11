import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus,
  Trash2
} from 'lucide-react';
import { FormattedNumber } from '../common/FormattedNumber';

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
  onOpenAddCategory?: () => void;
  onOpenAddPerson?: () => void;
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
  onSubmit,
  onOpenAddCategory,
  onOpenAddPerson
}: TransactionModalProps) => {
  const isAdd = mode === 'add';

  const handleSplitChange = (index: number, field: string, value: any) => {
    const newSplits = [...(transaction.splits || [])];
    newSplits[index] = { ...newSplits[index], [field]: value };
    
    const cleanValue = typeof value === 'string' ? value.replace(/,/g, '.').replace(/٫/g, '.') : value;
    const val = parseFloat(cleanValue) || 0;
    
    const txAmount = parseFloat(transaction.amount?.toString().replace(/,/g, '.').replace(/٫/g, '.')) || 0;
    
    if (field === 'percentage' && txAmount > 0) {
      const newAmount = (txAmount * val) / 100;
      newSplits[index].amount = newAmount === 0 ? '' : parseFloat(newAmount.toFixed(3));
    } else if (field === 'amount' && txAmount > 0) {
      const newPercentage = (val / txAmount) * 100;
      newSplits[index].percentage = newPercentage === 0 ? '' : parseFloat(newPercentage.toFixed(2));
    }
    
    setTransaction({ ...transaction, splits: newSplits });
  };

  const recalculateSplitsEqually = (currentSplits: any[]) => {
    if (currentSplits.length === 0) return [];
    const txAmount = parseFloat(transaction.amount?.toString().replace(/,/g, '.').replace(/٫/g, '.')) || 0;
    const splitAmount = txAmount / currentSplits.length;
    const splitPercentage = 100 / currentSplits.length;
    return currentSplits.map(s => ({
      ...s,
      amount: splitAmount === 0 ? '' : parseFloat(splitAmount.toFixed(3)),
      percentage: splitPercentage === 0 ? '' : parseFloat(splitPercentage.toFixed(2))
    }));
  };

  const togglePersonSplit = (personName: string) => {
    const currentSplits = transaction.splits || [];
    const isSelected = currentSplits.some((s: any) => s.personName === personName);
    
    let newSplits;
    if (isSelected) {
      newSplits = currentSplits.filter((s: any) => s.personName !== personName);
    } else {
      newSplits = [...currentSplits, { personName, percentage: 0, amount: 0 }];
    }
    
    newSplits = recalculateSplitsEqually(newSplits);
    setTransaction({ ...transaction, splits: newSplits });
  };

  const toggleAllSplits = () => {
    const currentSplits = transaction.splits || [];
    let newSplits;
    if (currentSplits.length === persons.length) {
      newSplits = [];
    } else {
      newSplits = persons.map((p: any) => ({
        personName: p.name,
        percentage: 0,
        amount: 0
      }));
      newSplits = recalculateSplitsEqually(newSplits);
    }
    setTransaction({ ...transaction, splits: newSplits });
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
              </div>
              <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-500 transition-all duration-300 active:scale-90">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-3 space-y-2 overflow-y-auto custom-scrollbar flex-1">
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
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.001"
                    required
                    value={transaction.amount}
                    onChange={(e) => {
                      const newAmount = e.target.value;
                      const numNewAmount = parseFloat(newAmount) || 0;
                      let newCustodyAmount = transaction.custodyAmount;
                      const currentPercentage = parseFloat(transaction.custodyAmountPercentage);
                      
                      if (!isNaN(currentPercentage)) {
                        newCustodyAmount = numNewAmount > 0 ? ((numNewAmount * currentPercentage) / 100).toString() : '';
                      } else if (!transaction.custodyAmount || transaction.custodyAmount === transaction.amount) {
                        newCustodyAmount = newAmount;
                      }

                      setTransaction({ 
                        ...transaction, 
                        amount: newAmount,
                        custodyAmount: newCustodyAmount
                      });
                    }}
                    className="w-full bg-transparent border-b-2 border-gray-200 p-3 text-3xl font-black text-center text-gray-900 focus:border-gray-800 transition-all outline-none placeholder:text-gray-200"
                    placeholder="0.000"
                    autoFocus
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300 text-lg">د.ك</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setTransaction({ ...transaction, type: 'expense', custodyType: 'custody_out' })}
                    className={`flex items-center justify-center gap-1 p-3 rounded-xl border transition-all duration-300 font-bold text-sm ${
                      transaction.type === 'expense' 
                        ? 'bg-gray-900 border-gray-900 text-white shadow-md' 
                        : 'bg-transparent border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <ArrowDownLeft className="w-5 h-5" />
                    مصروف
                  </button>
                  <button 
                    type="button"
                    onClick={() => setTransaction({ ...transaction, type: 'income', custodyType: 'custody_in' })}
                    className={`flex items-center justify-center gap-1 p-3 rounded-xl border transition-all duration-300 font-bold text-sm ${
                      transaction.type === 'income' 
                        ? 'bg-gray-900 border-gray-900 text-white shadow-md' 
                        : 'bg-transparent border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    إيراد
                  </button>
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-bold text-gray-800 border-b pb-2">المعلومات الأساسية</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">الفئة</label>
                    <div className="flex gap-2">
                      <select 
                        required
                        value={transaction.category || ''}
                        onChange={(e) => {
                          setTransaction({ ...transaction, category: e.target.value, isAddingNewCategory: false, newCategoryName: '' });
                        }}
                        className="flex-1 bg-transparent border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-gray-500 transition-colors"
                      >
                        <option value="" disabled>اختر الفئة...</option>
                        {categories.filter(c => c.type === transaction.type || c.type === 'all').map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      {onOpenAddCategory && (
                        <button type="button" onClick={onOpenAddCategory} className="px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors">
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">الموظف</label>
                    <div className="flex gap-2">
                      <select 
                        value={transaction.personName || ''}
                        onChange={(e) => setTransaction({ ...transaction, personName: e.target.value })}
                        className="flex-1 bg-transparent border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-gray-500 transition-colors"
                      >
                        <option value="">بدون موظف (اختياري)</option>
                        {persons.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                      {onOpenAddPerson && (
                        <button type="button" onClick={onOpenAddPerson} className="px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors">
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">التاريخ</label>
                    <input 
                      type="date" 
                      required
                      value={isAdd ? transaction.date : (transaction.date?.toDate ? transaction.date.toDate().toISOString().split('T')[0] : transaction.date)}
                      onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
                      className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-gray-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">الوصف</label>
                    <textarea 
                      value={transaction.description}
                      onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
                      rows={2}
                      className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-gray-500 transition-colors resize-none"
                      placeholder="ملاحظات إضافية..."
                    />
                  </div>
                </div>
              </div>

              {/* Custody Linking Section */}
              <div className="space-y-4 mb-6">
                 <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-sm font-bold text-gray-800">الربط بحساب مالي</h4>
                    <button 
                      type="button"
                      onClick={() => setTransaction({ ...transaction, isCustodyLinked: !transaction.isCustodyLinked })}
                      className={`w-11 h-6 rounded-full transition-all duration-300 relative ${transaction.isCustodyLinked ? 'bg-gray-900' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${transaction.isCustodyLinked ? 'right-6' : 'right-1'}`}></div>
                    </button>
                  </div>

                  {transaction.isCustodyLinked && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-2"
                    >
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">الحساب</label>
                        {custodyAccounts.length > 0 ? (
                          <select 
                            required={transaction.isCustodyLinked}
                            value={transaction.custodyAccountId}
                            onChange={(e) => setTransaction({ ...transaction, custodyAccountId: e.target.value })}
                            className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-gray-500 transition-colors"
                          >
                            <option value="">اختر الحساب...</option>
                            {custodyAccounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.name} (الرصيد: {acc.balance.toLocaleString('en-US')})</option>
                            ))}
                          </select>
                        ) : (
                          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-500 text-center">
                            لا يوجد حسابات - سيتم إنشاء "حساب الشركة" تلقائياً
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button"
                          onClick={() => setTransaction({ ...transaction, custodyType: 'custody_out' })}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            transaction.custodyType === 'custody_out' 
                              ? 'bg-gray-900 border-gray-900 text-white' 
                              : 'bg-transparent border-gray-200 text-gray-500'
                          }`}
                        >
                          سحب من الحساب
                        </button>
                        <button 
                          type="button"
                          onClick={() => setTransaction({ ...transaction, custodyType: 'custody_in' })}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            transaction.custodyType === 'custody_in' 
                              ? 'bg-gray-900 border-gray-900 text-white' 
                              : 'bg-transparent border-gray-200 text-gray-500'
                          }`}
                        >
                          إيداع في الحساب
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1.5">المبلغ من الحساب</label>
                          <input 
                            type="number" 
                            step="0.001"
                            required={transaction.isCustodyLinked && custodyAccounts.length > 0}
                            value={transaction.custodyAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              const numVal = parseFloat(val) || 0;
                              const txAmount = parseFloat(transaction.amount) || 0;
                              let percentage = '';
                              if (txAmount > 0 && numVal > 0) {
                                percentage = parseFloat(((numVal / txAmount) * 100).toFixed(2)).toString();
                              } else if (numVal === 0) {
                                percentage = '0';
                              }
                              setTransaction({ ...transaction, custodyAmount: val, custodyAmountPercentage: percentage });
                            }}
                            className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-gray-500 transition-colors"
                            placeholder="المبلغ"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1.5">النسبة %</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={transaction.custodyAmountPercentage ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const numVal = parseFloat(val) || 0;
                              const txAmount = parseFloat(transaction.amount) || 0;
                              let amount = '';
                              if (txAmount > 0 && numVal > 0) {
                                amount = parseFloat(((txAmount * numVal) / 100).toFixed(3)).toString();
                              } else if (numVal === 0) {
                                amount = '0';
                              }
                              setTransaction({ ...transaction, custodyAmountPercentage: val, custodyAmount: amount });
                            }}
                            className="w-full bg-transparent border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-gray-500 transition-colors"
                            placeholder="النسبة %"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
              </div>

              {/* Split Section */}
              <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-sm font-bold text-gray-800">تقسيم المبالغ</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">اختر الموظفين المشتركين:</span>
                      <button 
                        type="button"
                        onClick={toggleAllSplits}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
                      >
                        {transaction.splits?.length === persons.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {persons.map((p: any) => {
                        const isSelected = transaction.splits?.some((s: any) => s.personName === p.name);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => togglePersonSplit(p.name)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                              isSelected 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            {p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {transaction.splits?.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    {transaction.splits?.map((split: any, index: number) => (
                      <div 
                        key={index}
                        className="p-4 rounded-xl border border-gray-200 space-y-4 relative group bg-gray-50/50"
                      >
                        <button 
                          type="button"
                          onClick={() => removeSplit(index)}
                          className="absolute left-3 top-3 text-gray-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="pr-8">
                          <label className="block text-xs font-bold text-gray-500 mb-1.5">الموظف</label>
                          <div className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm font-bold text-gray-700">
                            {split.personName}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">النسبة (%)</label>
                            <input 
                              type="number" 
                              step="0.1"
                              required
                              value={split.percentage === 0 && split.amount === 0 ? '' : split.percentage}
                              onChange={(e) => handleSplitChange(index, 'percentage', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-gray-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">المبلغ</label>
                            <input 
                              type="number" 
                              step="0.001"
                              required
                              value={split.amount === 0 && split.percentage === 0 ? '' : split.amount}
                              onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-gray-500"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                      <div className="pt-2 flex justify-between items-center px-1">
                        <span className="text-xs font-bold text-gray-500">إجمالي التقسيم:</span>
                        <span className={`text-sm font-black ${
                          Math.abs(transaction.splits.reduce((sum: number, s: any) => sum + s.percentage, 0) - 100) < 0.01 
                            ? 'text-emerald-600' 
                            : 'text-rose-600'
                        }`}>
                          {transaction.splits.reduce((sum: number, s: any) => sum + s.percentage, 0)}%
                        </span>
                      </div>
                  </div>
                  )}
              </div>

              <div className="pt-4 mt-auto">
                <button 
                  type="submit"
                  disabled={formStatus.type === 'loading'}
                  className="w-full py-4 rounded-xl font-black text-sm bg-gray-900 text-white shadow-lg shadow-gray-900/20 transition-all duration-300 disabled:opacity-50 active:scale-[0.98] hover:bg-gray-800"
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
