import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...rest }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-700">{label}</label>}
      <input
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        } ${className}`.trim()}
        {...rest}
      />
      {error ? <span className="text-[11px] font-semibold text-red-600">{error}</span> : null}
    </div>
  );
};

export default Input;
