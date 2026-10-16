import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorColor?: string;
}

export function Progress({ className, value = 0, indicatorColor = 'bg-emerald-500', ...props }: ProgressProps) {
  return (
    <div className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/80', className)} {...props}>
      <div
        className={cn('h-full w-full flex-1 transition-all duration-300 rounded-full', indicatorColor)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}
