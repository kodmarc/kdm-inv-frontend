import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...rest }) => {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};

export default Card;
