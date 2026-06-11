import React from 'react';
import { Transaction, CustodyAccount } from '../../types';

interface MonthlyReportTemplateProps {
  transactions: Transaction[];
  custodyAccounts: CustodyAccount[];
}

export const MonthlyReportTemplate = ({ transactions, custodyAccounts }: MonthlyReportTemplateProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  };

  const incomes = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;
  const totalCustody = custodyAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

  // Group expenses by category
  const expenseByCategory: Record<string, number> = {};
  expenses.forEach(t => {
    const cat = t.category || 'أخرى';
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(t.amount || 0);
  });

  const sortedCategories = Object.entries(expenseByCategory)
    .sort(([, a], [, b]) => b - a);

  // Top 10 biggest transactions
  const topExpenses = [...expenses]
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, 10);

  const currentDate = new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());

  return (
    <div 
      id="pdf-report-template" 
      className="bg-white text-black p-8"
      style={{ 
        width: '210mm',
        minHeight: '297mm',
        direction: 'rtl',
        fontFamily: "'Cairo', sans-serif",
        display: 'none', // Hidden in DOM, shown by pdfUtils during generation
        position: 'absolute',
        left: '-9999px',
        top: 0
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b-4 border-blue-900 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-blue-900 mb-2">المحاسب الذكي</h1>
          <h2 className="text-2xl font-bold text-gray-600">التقرير المالي الشامل</h2>
        </div>
        <div className="text-left text-sm text-gray-500">
          <p>تاريخ الإصدار:</p>
          <p className="font-bold">{currentDate}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100">
          <p className="text-blue-900 font-bold mb-2">إجمالي الإيرادات</p>
          <p className="text-3xl font-black text-blue-700">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100">
          <p className="text-red-900 font-bold mb-2">إجمالي المصروفات</p>
          <p className="text-3xl font-black text-red-700">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100">
          <p className="text-emerald-900 font-bold mb-2">صافي الأرباح</p>
          <p className="text-3xl font-black text-emerald-700">{formatCurrency(netProfit)}</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100">
          <p className="text-purple-900 font-bold mb-2">إجمالي رصيد الحسابات</p>
          <p className="text-3xl font-black text-purple-700">{formatCurrency(totalCustody)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        {/* Category Breakdown */}
        <div>
          <h3 className="text-xl font-black text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">تفصيل المصروفات حسب الفئة</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-right rounded-r-lg font-bold">الفئة</th>
                <th className="p-3 text-left rounded-l-lg font-bold">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map(([cat, amount], idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="p-3 font-semibold">{cat}</td>
                  <td className="p-3 text-left font-black text-red-600">{formatCurrency(amount)}</td>
                </tr>
              ))}
              {sortedCategories.length === 0 && (
                <tr><td colSpan={2} className="p-4 text-center text-gray-400">لا توجد بيانات</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Custody Accounts Breakdown */}
        <div>
          <h3 className="text-xl font-black text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">الحسابات</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-right rounded-r-lg font-bold">الحساب</th>
                <th className="p-3 text-left rounded-l-lg font-bold">الرصيد المتبقي</th>
              </tr>
            </thead>
            <tbody>
              {custodyAccounts.map((acc, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="p-3 font-semibold">{acc.name}</td>
                  <td className="p-3 text-left font-black text-purple-600">{formatCurrency(acc.balance || 0)}</td>
                </tr>
              ))}
              {custodyAccounts.length === 0 && (
                <tr><td colSpan={2} className="p-4 text-center text-gray-400">لا توجد حسابات عهدة</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Transactions */}
      <div>
        <h3 className="text-xl font-black text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">أكبر العمليات المستهلكة للمصروفات</h3>
        <table className="w-full text-sm border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="p-3 text-right border-l border-gray-200 font-bold">التاريخ</th>
              <th className="p-3 text-right border-l border-gray-200 font-bold">الفئة</th>
              <th className="p-3 text-right border-l border-gray-200 font-bold">الشخص</th>
              <th className="p-3 text-right border-l border-gray-200 font-bold">الوصف</th>
              <th className="p-3 text-left font-bold">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {topExpenses.map((t, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="p-3 border-l border-gray-200 text-gray-600">{formatDate(t.date)}</td>
                <td className="p-3 border-l border-gray-200 font-bold text-gray-800">{t.category}</td>
                <td className="p-3 border-l border-gray-200 text-gray-600">{t.personName || '-'}</td>
                <td className="p-3 border-l border-gray-200 text-gray-600 text-xs w-1/3">{t.description || '-'}</td>
                <td className="p-3 text-left font-black text-red-600 whitespace-nowrap">{formatCurrency(t.amount)}</td>
              </tr>
            ))}
            {topExpenses.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-400 border border-gray-200">لا توجد عمليات مسجلة</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-gray-400 pt-8 border-t-2 border-gray-100">
        <p>تم استخراج هذا التقرير من تطبيق المحاسب الذكي</p>
      </div>
    </div>
  );
};
