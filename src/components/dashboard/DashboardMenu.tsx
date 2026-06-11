import React from 'react';
import { 
  Wallet, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Receipt, 
  Users,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';

export type DashboardViewType = 'menu' | 'budget' | 'flow' | 'monthly' | 'income' | 'expense' | 'people' | 'latest';

interface DashboardMenuProps {
  onSelectView: (view: DashboardViewType) => void;
}

export const DashboardMenu: React.FC<DashboardMenuProps> = ({ onSelectView }) => {
  const menuItems = [
    {
      id: 'budget' as DashboardViewType,
      title: 'الميزانية العامة',
      description: 'متابعة المصروفات مقابل الميزانية المحددة',
      icon: Wallet,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      id: 'flow' as DashboardViewType,
      title: 'التدفق المالي',
      description: 'تحليل الإيرادات والمصاريف والعهد',
      icon: BarChart3,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      id: 'monthly' as DashboardViewType,
      title: 'التقرير الشهري',
      description: 'مقارنة الأداء المالي عبر الأشهر',
      icon: LineChart,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      id: 'income' as DashboardViewType,
      title: 'توزيع الإيرادات',
      description: 'تحليل مصادر الإيرادات والفئات',
      icon: PieChart,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600'
    },
    {
      id: 'expense' as DashboardViewType,
      title: 'توزيع المصاريف',
      description: 'تحليل بنود المصاريف والفئات',
      icon: Receipt,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50',
      textColor: 'text-rose-600'
    },
    {
      id: 'people' as DashboardViewType,
      title: 'ملخص الموظفين',
      description: 'أرصدة وحسابات الموظفين',
      icon: Users,
      color: 'bg-cyan-500',
      lightColor: 'bg-cyan-50',
      textColor: 'text-cyan-600'
    },
    {
      id: 'latest' as DashboardViewType,
      title: 'آخر العمليات',
      description: 'سجل أحدث العمليات المسجلة',
      icon: History,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectView(item.id)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all flex flex-col items-center text-center group active:scale-95"
          >
            <div className={`w-14 h-14 ${item.lightColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-7 h-7 ${item.textColor}`} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">{item.title}</h3>
            <p className="text-xs font-bold text-gray-500 leading-relaxed">{item.description}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
