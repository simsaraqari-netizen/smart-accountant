import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Target, AlertTriangle } from 'lucide-react';
import { FormattedNumber } from '../common/FormattedNumber';
import { Category } from '../../types';

interface BudgetDashboardProps {
  categories: Category[];
  transactions: any[];
  currentMonth: Date;
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({ categories, transactions, currentMonth }) => {
  const budgetStats = useMemo(() => {
    const expensesWithBudget = categories.filter(c => c.type === 'expense' && c.budgetLimit && c.budgetLimit > 0);
    
    return expensesWithBudget.map(category => {
      // Calculate spent amount in current month for this category
      const spent = transactions.reduce((acc, tx) => {
        if (tx.type !== 'expense' || tx.category !== category.name) return acc;
        
        // Check if transaction is in current month
        let txDate: Date;
        if (tx.date?.seconds) {
          txDate = new Date(tx.date.seconds * 1000);
        } else {
          txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
        }

        if (txDate.getMonth() === currentMonth.getMonth() && txDate.getFullYear() === currentMonth.getFullYear()) {
          // Add main amount
          if (tx.splitType === 'individual') {
            return acc + (Number(tx.amount) || 0);
          }
          // Add split amount
          if (tx.splitType === 'joint' && tx.splits) {
            const sum = tx.splits.reduce((sAcc: number, s: any) => sAcc + (Number(s.amount) || 0), 0);
            return acc + sum;
          }
        }
        return acc;
      }, 0);

      const limit = category.budgetLimit || 1;
      const percentage = Math.min((spent / limit) * 100, 100);
      const isOverBudget = spent >= limit;
      const isWarning = percentage >= 80 && !isOverBudget;

      return {
        ...category,
        spent,
        percentage,
        isOverBudget,
        isWarning
      };
    });
  }, [categories, transactions, currentMonth]);

  if (budgetStats.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
    >
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50">
        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
          <Target className="w-5 h-5" />
        </div>
        <h3 className="font-black text-gray-900 text-lg">مراقبة الميزانيات (الشهر الحالي)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetStats.map(stat => (
          <div key={stat.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-700 text-sm">{stat.name}</span>
              <div className="text-[10px] font-black">
                <span className={stat.isOverBudget ? 'text-rose-600' : 'text-gray-900'}>
                  <FormattedNumber value={stat.spent} />
                </span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-500">
                  <FormattedNumber value={stat.budgetLimit!} />
                </span>
              </div>
            </div>
            
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stat.percentage}%` }}
                className={`absolute top-0 bottom-0 right-0 rounded-full ${
                  stat.isOverBudget ? 'bg-rose-500' : 
                  stat.isWarning ? 'bg-amber-500' : 
                  'bg-emerald-500'
                }`}
              />
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className={`text-[10px] font-bold ${
                stat.isOverBudget ? 'text-rose-600' : 
                stat.isWarning ? 'text-amber-600' : 
                'text-emerald-600'
              }`}>
                {stat.percentage.toFixed(0)}% مستهلك
              </span>
              
              {(stat.isWarning || stat.isOverBudget) && (
                <span className={`flex items-center gap-1 text-[10px] font-bold ${stat.isOverBudget ? 'text-rose-600' : 'text-amber-600'}`}>
                  <AlertTriangle className="w-3 h-3" />
                  {stat.isOverBudget ? 'تجاوزت الميزانية!' : 'اقتربت من الحد'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
