import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-800 transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full rounded-lg border bg-white/50 backdrop-blur-sm px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400
            transition-all duration-200
            focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none
            disabled:bg-gray-50 disabled:text-gray-500
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 hover:border-gray-300'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};