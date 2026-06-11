import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface ExpenseDistributionProps {
  transactions: any[];
}

export const ExpenseDistribution: React.FC<ExpenseDistributionProps> = ({ transactions }) => {
  const expenseData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc: any[], t) => {
      const existing = acc.find((x) => x.name === t.category);
      if (existing) existing.value += t.amount;
      else acc.push({ name: t.category, value: t.amount });
      return acc;
    }, []);

  const colors = [
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#F43F5E",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6"
  ];

  if (expenseData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[300px]">
        <p className="text-gray-400 text-sm font-bold">لا توجد بيانات للمصاريف</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-emerald-600 text-center w-full">
          توزيع المصاريف
        </h3>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between flex-1 gap-6">
        {/* Legend */}
        <div className="w-full md:w-1/2 space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
          {expenseData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm font-bold text-gray-700 truncate">
                {item.name}
              </span>
              <span className="text-sm font-black text-gray-900 mr-auto">
                {item.value.toLocaleString("en-US")} د.ك
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full md:w-1/2 h-[300px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                }}
                formatter={(value: number) => [`${value.toLocaleString("en-US")} د.ك`, "المبلغ"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
