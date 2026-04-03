import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  isActive?: boolean;
  color?: 'emerald' | 'blue' | 'gray';
}

export const CollapsibleSection = ({ 
  title, 
  icon: Icon, 
  children, 
  defaultExpanded = false, 
  isActive = false, 
  color = 'emerald' 
}: CollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const getContainerClasses = () => {
    if (!isActive) return 'border-gray-200/50 bg-gray-50/50';
    if (color === 'emerald') return 'border-emerald-300/50 bg-emerald-200/50';
    if (color === 'blue') return 'border-blue-300/50 bg-blue-200/50';
    return 'border-gray-200/50 bg-gray-50/50';
  };

  const getIconClasses = () => {
    if (!isActive) return 'bg-gray-100/50 text-gray-500';
    if (color === 'emerald') return 'bg-emerald-100/50 text-emerald-700';
    if (color === 'blue') return 'bg-blue-100/50 text-blue-700';
    return 'bg-gray-100/50 text-gray-500';
  };

  const getTextClasses = () => {
    if (!isActive) return 'text-gray-700';
    if (color === 'emerald') return 'text-emerald-900';
    if (color === 'blue') return 'text-blue-900';
    return 'text-gray-700';
  };

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-300 ${getContainerClasses()}`}>
      <button 
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-3 flex items-center justify-between bg-transparent hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md ${getIconClasses()}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className={`font-bold text-sm ${getTextClasses()}`}>{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isActive ? getTextClasses() : 'text-gray-400'}`} />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 border-t border-black/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
