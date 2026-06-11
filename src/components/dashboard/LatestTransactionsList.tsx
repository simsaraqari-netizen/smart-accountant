import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Coins } from 'lucide-react';
import { FormattedNumber } from '../common/FormattedNumber';

interface LatestTransactionsListProps {
  transactions: any[];
  custodyAccounts: any[];
  onViewAll: () => void;
}

export const LatestTransactionsList: React.FC<LatestTransactionsListProps> = ({ 
  transactions, 
  custodyAccounts,
  onViewAll
}) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
        <h3 className="text-sm font-black text-emerald-600">
          آخر العمليات
        </h3>
        <button
          onClick={onViewAll}
          className="text-emerald-600 text-xs font-semibold hover:underline bg-emerald-50 px-3 py-1 rounded-full transition-colors"
        >
          عرض الكل في السجل
        </button>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8 font-bold">
            لا توجد عمليات مسجلة
          </p>
        ) : (
          transactions.slice(0, 15).map((tx) => {
            const custodyAccount = tx.custodyAccountId
              ? custodyAccounts.find((acc) => acc.id === tx.custodyAccountId)
              : null;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 md:p-3 rounded-full ${
                      tx.type === "income"
                        ? "bg-emerald-100 text-emerald-600"
                        : tx.type === "expense"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm md:text-base truncate">
                      {tx.category}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] md:text-xs text-gray-500 font-semibold">
                        {format(tx.date.toDate(), "d MMMM yyyy", { locale: ar })}
                      </p>
                      {tx.splits && tx.splits.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 rounded-full font-bold">
                            مقسم
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                  {custodyAccount && (
                    <div className="flex items-center justify-center p-1.5 md:p-2 bg-amber-50 rounded-lg" title={`عهدة: ${custodyAccount.name}`}>
                      <Coins className="w-3 h-3 md:w-4 md:h-4 text-amber-600" />
                    </div>
                  )}
                  <p
                    className={`font-black text-sm md:text-lg flex items-center gap-1 ${
                      tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}<FormattedNumber value={tx.amount} />
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
