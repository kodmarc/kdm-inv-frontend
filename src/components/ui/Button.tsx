import React from 'react';

type Variant = 'primary' | 'ghost' | 'surface' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50';

const variantMap: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
  ghost: 'border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  surface: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  outline: 'border border-blue-200 bg-transparent text-blue-600 hover:bg-blue-50',
};

const sizeMap: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variantMap[variant]} ${sizeMap[size]} ${className}`.trim()}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
