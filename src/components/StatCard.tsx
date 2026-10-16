import React from 'react';
import { LucideIcon } from 'lucide-react';
import AnimatedCounter from '@/components/ui/animated-counter';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'default';
  trend?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
}: StatCardProps) {
  const variantStyles = {
    danger: {
      border: 'border-slate-200/90 hover:border-red-300',
      iconBg: 'bg-red-50 text-red-600 border border-red-100',
      valueColor: 'text-slate-900',
      trendBg: 'bg-red-50 text-red-700 border-red-200',
    },
    warning: {
      border: 'border-slate-200/90 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      valueColor: 'text-slate-900',
      trendBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    success: {
      border: 'border-slate-200/90 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      valueColor: 'text-slate-900',
      trendBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    info: {
      border: 'border-slate-200/90 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      valueColor: 'text-slate-900',
      trendBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    default: {
      border: 'border-slate-200/90 hover:border-teal-300',
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-100',
      valueColor: 'text-slate-900',
      trendBg: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`p-5 rounded-2xl bg-white border shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${style.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">{title}</span>
        <div className={`p-2.5 rounded-xl ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${style.valueColor}`}>
          <AnimatedCounter value={value} />
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            {subtitle && <span className="truncate">{subtitle}</span>}
            {trend && (
              <span className={`font-semibold px-2 py-0.5 rounded-full border font-mono text-[10px] shrink-0 ${style.trendBg}`}>
                {trend}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
