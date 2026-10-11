import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    secondary: 'bg-slate-800 text-slate-300 border-slate-700',
    destructive: 'bg-red-950/80 text-red-300 border-red-800 animate-pulse',
    outline: 'border-slate-700 text-slate-300',
    success: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    warning: 'bg-amber-950 text-amber-300 border-amber-800',
    info: 'bg-blue-950 text-blue-300 border-blue-800',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
