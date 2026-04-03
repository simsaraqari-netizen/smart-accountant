import React from 'react';
import { motion } from 'motion/react';
import { FormattedNumber } from './FormattedNumber';

interface StatCardProps {
  title: string;
  amount: number;
  icon: any;
  color: string;
  trend?: number;
  onClick?: () => void;
}

export const StatCard = ({ 
  title, 
  amount, 
  icon: Icon, 
  color, 
  trend, 
  onClick 
}: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={onClick ? { scale: 1.02, backgroundColor: '#F8FAFC' } : {}}
    whileTap={onClick ? { scale: 0.98 } : {}}
    onClick={onClick}
    className={`ios-card p-2 flex items-center gap-2 transition-all ${onClick ? 'cursor-pointer hover:border-[var(--color-ios-blue)]/30' : ''}`}
  >
    <div className={`p-1.5 rounded-full ${color} shrink-0 shadow-sm`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="flex flex-1 items-center justify-between gap-1 min-w-0">
      <div className="min-w-0">
        <p className="text-[10px] text-gray-500 font-bold truncate leading-tight mb-0">{title}</p>
        <h3 className="text-base font-black text-gray-900 truncate flex items-center gap-1">
          <FormattedNumber value={amount} /> <span className="text-[9px] font-bold text-gray-400">د.ك</span>
        </h3>
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  </motion.div>
);
