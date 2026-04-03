import React from 'react';

interface FormattedNumberProps {
  value: number;
  className?: string;
}

export const FormattedNumber = ({ value, className = "" }: FormattedNumberProps) => {
  const isNegative = value < 0;
  const absValue = Math.abs(value).toLocaleString('en-US');
  
  return (
    <span className={`inline-flex items-center ${className}`} dir="ltr">
      {isNegative && <span className="text-emerald-500 mr-1 font-black">-</span>}
      <span>{absValue}</span>
    </span>
  );
};
