import React from 'react';

type BadgeColor = 'green' | 'red' | 'amber' | 'blue' | 'slate' | 'purple' | 'navy';

interface BadgeProps {
  color?: BadgeColor;
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  navy: 'bg-[#0F172A]/10 text-[#0F172A] border-[#0F172A]/20',
};

export const Badge: React.FC<BadgeProps> = ({ color = 'slate', children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-none ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
