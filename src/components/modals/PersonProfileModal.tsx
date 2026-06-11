import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, Wallet, Printer, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { FormattedNumber } from '../common/FormattedNumber';

interface PersonProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: any;
  transactions: any[];
}

export const PersonProfileModal: React.FC<PersonProfileModalProps> = ({
  isOpen,
  onClose,
  person,
  transactions
}) => {
  // Filter and calculate stats specifically for this person
  const { personTransactions, stats } = useMemo(() => {
    if (!person) return { personTransactions: [], stats: { income: 0, expense: 0, net: 0 } };

    let income = 0;
    let expense = 0;
    const txs: any[] = [];

    transactions.forEach(tx => {
      let isRelated = false;
      let amountForPerson = 0;
      
      const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;

      // Direct
      if (tx.splitType === 'individual' && tx.personName === person.name) {
        isRelated = true;
        amountForPerson = amount;
      }
      
      // Joint
      if (tx.splitType === 'joint' && tx.splits) {
        const split = tx.splits.find((s: any) => s.personName === person.name);
        if (split) {
          isRelated = true;
          amountForPerson = typeof split.amount === 'string' ? parseFloat(split.amount) : split.amount;
        }
      }

      if (isRelated) {
        txs.push({ ...tx, amountForPerson });
        if (tx.type === 'income' || tx.type === 'custody_in') income += amountForPerson;
        if (tx.type === 'expense' || tx.type === 'custody_out') expense += amountForPerson;
      }
    });

    // Sort by date descending
    txs.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());

    return { 
      personTransactions: txs, 
      stats: { income, expense, net: income - expense }
    };
  }, [person, transactions]);

  const handlePrint = () => {
    window.print();
  };

  if (!person) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 print:absolute print:inset-0 print:bg-white print:z-[9999]">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm print:hidden"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative bg-white w-full h-full shadow-2xl overflow-hidden flex flex-col print:shadow-none print:h-auto"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10 print:hidden">
              <div className="w-10">
                <button onClick={handlePrint} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900">
                  <Printer className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-black text-blue-600">كشف حساب</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            {/* Print Header */}
            <div className="hidden print:block text-center mb-8 border-b-2 border-gray-200 pb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">كشف حساب موظف</h1>
              <p className="text-sm text-gray-500">تاريخ الإصدار: {format(new Date(), 'd/M/yyyy', { locale: ar })}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 print:overflow-visible print:p-0">
              
              {/* Profile Summary */}
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 mb-6 text-center">
                <h2 className="text-2xl font-black text-gray-900 mb-2">{person.name}</h2>
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-bold text-gray-500">الرصيد الصافي:</span>
                  <span className={`text-lg font-black ${
                    stats.net > 0 ? 'text-emerald-600' : 
                    stats.net < 0 ? 'text-rose-600' : 
                    'text-gray-900'
                  }`}>
                    <FormattedNumber value={Math.abs(stats.net)} />
                    <span className="text-[10px] font-bold ml-1 text-gray-500">
                      {stats.net > 0 ? 'له' : stats.net < 0 ? 'عليه' : 'متزن'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm text-center">
                  <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 mb-1">إجمالي الإيرادات</p>
                  <p className="text-lg font-black text-emerald-600"><FormattedNumber value={stats.income} /></p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm text-center">
                  <div className="w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ArrowDownLeft className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 mb-1">إجمالي المدفوعات</p>
                  <p className="text-lg font-black text-rose-600"><FormattedNumber value={stats.expense} /></p>
                </div>
              </div>

              {/* Transactions List */}
              <div>
                <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  سجل العمليات
                </h4>
                
                {personTransactions.length === 0 ? (
                  <p className="text-center text-sm font-bold text-gray-400 py-8">لا توجد عمليات مسجلة لهذا الموظف.</p>
                ) : (
                  <div className="space-y-3 print:space-y-0 print:border print:border-gray-200">
                    {/* Print Table Header */}
                    <div className="hidden print:grid grid-cols-4 bg-gray-100 p-3 text-xs font-bold text-gray-700 border-b border-gray-200">
                      <div>التاريخ</div>
                      <div>البيان</div>
                      <div className="text-center">المبلغ</div>
                      <div className="text-left">النوع</div>
                    </div>

                    {personTransactions.map(tx => (
                      <div key={tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between print:rounded-none print:shadow-none print:border-0 print:border-b print:border-gray-100 print:grid print:grid-cols-4 print:p-3">
                        <div className="flex items-center gap-3 print:col-span-2 print:flex-row print:gap-4">
                          <div className={`p-2 rounded-xl print:hidden ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                            {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 mb-0.5 print:text-[11px]">{tx.description || tx.category}</p>
                            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-2 print:text-[9px]">
                              {format(tx.date.toDate(), 'd/M/yyyy', { locale: ar })}
                              {tx.splitType === 'joint' && (
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">عملية مشتركة</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-left print:col-span-2 print:flex print:justify-between print:items-center">
                          <p className={`text-sm font-black print:text-xs ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.type === 'income' ? '+' : '-'}<FormattedNumber value={tx.amountForPerson} />
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 print:hidden">{tx.category}</p>
                          <p className="hidden print:block text-[10px] text-gray-500">{tx.type === 'income' ? 'ايراد' : 'مصروف'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
