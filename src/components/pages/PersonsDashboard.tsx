import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, UserPlus, ArrowUpRight, ArrowDownLeft, Wallet, Search, Pencil, Trash2 } from 'lucide-react';
import { FormattedNumber } from '../common/FormattedNumber';

interface PersonsDashboardProps {
  persons: any[];
  transactions: any[];
  userRole: string | null;
  onOpenAddPerson: () => void;
  onOpenPersonProfile: (person: any) => void;
  onEditPerson: (person: any) => void;
  onDeletePerson: (person: any) => void;
}

export const PersonsDashboard: React.FC<PersonsDashboardProps> = ({
  persons,
  transactions,
  userRole,
  onOpenAddPerson,
  onOpenPersonProfile,
  onEditPerson,
  onDeletePerson
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate stats for each person
  const personsStats = useMemo(() => {
    return persons.map(person => {
      let totalIncome = 0;
      let totalExpense = 0;

      transactions.forEach(tx => {
        const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
        
        // Direct transaction
        if (tx.splitType === 'individual' && tx.personName === person.name) {
          if (tx.type === 'income') totalIncome += amount;
          if (tx.type === 'expense') totalExpense += amount;
        }
        
        // Joint transaction
        if (tx.splitType === 'joint' && tx.splits) {
          const split = tx.splits.find((s: any) => s.personName === person.name);
          if (split) {
            const splitAmount = typeof split.amount === 'string' ? parseFloat(split.amount) : split.amount;
            if (tx.type === 'income') totalIncome += splitAmount;
            if (tx.type === 'expense') totalExpense += splitAmount;
          }
        }
      });

      return {
        ...person,
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense
      };
    });
  }, [persons, transactions]);

  // Filter persons
  const filteredPersons = personsStats.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      key="persons_dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">إدارة الأشخاص والجهات</h2>
            <p className="text-xs font-bold text-gray-500">متابعة حسابات العملاء والموردين</p>
          </div>
        </div>
        <button 
          onClick={onOpenAddPerson}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <UserPlus className="w-4 h-4" />
          إضافة شخص
        </button>
      </div>

      <div className="relative">
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث عن شخص أو جهة..."
          className="w-full bg-white border-2 border-gray-100 rounded-2xl p-4 pl-12 text-sm font-bold text-right focus:border-blue-500 transition-all outline-none shadow-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersons.map(person => (
          <motion.div 
            key={person.id}
            whileHover={{ y: -5 }}
            onClick={() => onOpenPersonProfile(person)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
              <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                {person.name}
              </h3>
              <div className="flex gap-1">
                {userRole === 'admin' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPerson(person);
                      }}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors z-10 relative"
                      title="تعديل الموظف"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePerson(person);
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors z-10 relative"
                      title="حذف الموظف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors z-0">
                  <Users className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" /> ايرادات
                </span>
                <span className="text-sm font-black text-emerald-600">
                  <FormattedNumber value={person.totalIncome} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                  <ArrowDownLeft className="w-3 h-3 text-rose-500" /> مدفوعات
                </span>
                <span className="text-sm font-black text-rose-600">
                  <FormattedNumber value={person.totalExpense} />
                </span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-50 flex justify-between items-center bg-gray-50/50 p-2 rounded-xl">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> الرصيد
                </span>
                <span className={`text-base font-black ${
                  person.net > 0 ? 'text-emerald-600' : 
                  person.net < 0 ? 'text-rose-600' : 
                  'text-gray-900'
                }`}>
                  <FormattedNumber value={Math.abs(person.net)} />
                  <span className="text-[10px] font-bold ml-1 text-gray-500">
                    {person.net > 0 ? 'له' : person.net < 0 ? 'عليه' : 'متزن'}
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPersons.length === 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">لا يوجد أشخاص</h3>
          <p className="text-sm font-bold text-gray-500">
            {searchTerm ? 'لم يتم العثور على نتائج للبحث.' : 'قم بإضافة أشخاص أو جهات لتتمكن من متابعة حساباتهم بشكل منفصل.'}
          </p>
        </div>
      )}
    </motion.div>
  );
};
