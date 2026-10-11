import React from 'react';
import { LucideIcon } from 'lucide-react';

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
      border: 'border-red-500/30 hover:border-red-500/50',
      iconBg: 'bg-red-500/10 text-red-400',
      glow: 'shadow-red-500/5',
      valueColor: 'text-red-400',
    },
    warning: {
      border: 'border-amber-500/30 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'shadow-amber-500/5',
      valueColor: 'text-amber-400',
    },
    success: {
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'shadow-emerald-500/5',
      valueColor: 'text-emerald-400',
    },
    info: {
      border: 'border-cyan-500/30 hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      glow: 'shadow-cyan-500/5',
      valueColor: 'text-cyan-400',
    },
    default: {
      border: 'border-slate-800 hover:border-slate-700',
      iconBg: 'bg-slate-800 text-slate-300',
      glow: 'shadow-slate-500/5',
      valueColor: 'text-white',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`glass-panel p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 shadow-xl ${style.border} ${style.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className={`text-2xl sm:text-3xl font-black tracking-tight ${style.valueColor}`}>{value}</span>
        {trend && <span className="text-[11px] font-mono text-slate-400">{trend}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400 truncate">{subtitle}</p>}
    </div>
  );
}
