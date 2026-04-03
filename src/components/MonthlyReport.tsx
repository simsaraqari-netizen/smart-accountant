import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '../types'; // Assuming types are in types.ts

interface MonthlyReportProps {
  transactions: Transaction[];
  onClick: () => void;
}

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export const MonthlyReport: React.FC<MonthlyReportProps> = ({ transactions, onClick }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const reportData = useMemo(() => {
    const filtered = transactions.filter(tx => tx.date.toDate().toISOString().slice(0, 7) === selectedMonth);
    const expenses = filtered.filter(tx => tx.type === 'expense');
    
    const categoryTotals = expenses.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [transactions, selectedMonth]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-200 transition-all" onClick={onClick}>
      <div className="flex justify-between items-center mb-3">
        <div className="w-10"></div>
        <h3 className="text-sm font-black text-rose-700 text-center">تقرير المصاريف الشهري</h3>
        <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-rose-700 text-[10px] font-semibold hover:underline">عرض الكل</button>
      </div>
      
      <div className="flex items-center justify-between h-[140px]">
        {/* Chart (Left) */}
        <div className="w-[120px] h-full shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reportData}
                innerRadius={35}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
              >
                {reportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend (Right) */}
        <div className="flex-1 space-y-2 overflow-y-auto max-h-full pl-2">
          {reportData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span className="text-[10px] font-bold text-gray-700 truncate">{item.name}</span>
              <span className="text-[9px] text-gray-400 mr-auto">{item.value.toLocaleString('en-US')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
