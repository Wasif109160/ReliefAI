import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'emergency';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none';

    const variants = {
      default: 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-md shadow-cyan-950/40',
      destructive: 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-950/40',
      emergency: 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white hover:brightness-110 shadow-lg shadow-red-600/30 uppercase font-black',
      outline: 'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/60',
      ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
      link: 'text-cyan-400 underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-lg px-3 text-[11px]',
      lg: 'h-12 rounded-2xl px-6 text-sm font-bold',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
