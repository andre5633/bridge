import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, icon, children, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[9px] font-black text-gray-400 mb-1.5 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
            {icon}
          </div>
        )}
        <select
          className={`
            w-full appearance-none rounded-2xl border-0 bg-gray-50 px-4 py-4 text-sm font-bold text-gray-900
            transition-all duration-200 cursor-pointer
            focus:ring-4 focus:ring-black/5 outline-none
            ${icon ? 'pl-11' : ''}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
          <ChevronDown size={16} strokeWidth={3} />
        </div>
      </div>
    </div>
  );
};