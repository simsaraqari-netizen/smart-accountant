import React from 'react';
import { FormattedNumber } from '../common/FormattedNumber';

interface PeopleSummaryProps {
  transactions: any[];
}

export const PeopleSummary: React.FC<PeopleSummaryProps> = ({ transactions }) => {
  const peopleData = transactions.reduce(
    (acc: any, t) => {
      // Handle main person
      if (t.personName) {
        if (!acc[t.personName]) {
          acc[t.personName] = { income: 0, expense: 0 };
        }
        if (t.type === "income")
          acc[t.personName].income += t.amount;
        if (t.type === "expense")
          acc[t.personName].expense += t.amount;
      }

      // Handle splits
      if (t.splits && t.splits.length > 0) {
        t.splits.forEach((split: any) => {
          if (!acc[split.personName]) {
            acc[split.personName] = {
              income: 0,
              expense: 0,
            };
          }
          if (t.type === "income")
            acc[split.personName].income += split.amount;
          if (t.type === "expense")
            acc[split.personName].expense += split.amount;
        });
      }
      return acc;
    },
    {},
  );

  const peopleList = Object.entries(peopleData).map(
    ([name, totals]: [string, any]) => ({
      name,
      ...totals,
      balance: totals.income - totals.expense,
    }),
  );

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-emerald-600 text-center w-full">
          ملخص حسابات الموظفين
        </h3>
      </div>
      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
        {peopleList.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8 font-bold">
            لا توجد بيانات للموظفين بعد
          </p>
        ) : (
          peopleList
            .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
            .map((person) => (
              <div
                key={person.name}
                className="p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl border border-gray-100"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-black text-gray-900">
                    {person.name}
                  </span>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      person.balance > 0
                        ? "bg-emerald-100 text-emerald-700"
                        : person.balance < 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    <FormattedNumber value={Math.abs(person.balance)} /> د.ك
                    <span className="text-[10px] mr-1 opacity-75">
                      {person.balance > 0 ? '(له)' : person.balance < 0 ? '(عليه)' : '(متزن)'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-6 text-xs text-gray-500 font-semibold border-t border-gray-200 pt-3 mt-1">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    إجمالي الإيرادات:{" "}
                    <span className="text-gray-900"><FormattedNumber value={person.income} /></span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                    إجمالي المصاريف:{" "}
                    <span className="text-gray-900"><FormattedNumber value={person.expense} /></span>
                  </span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
