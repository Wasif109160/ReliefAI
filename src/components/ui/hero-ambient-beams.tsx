'use client';

import React from 'react';

export function HeroAmbientBeams({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Subtle Dot Grid Pattern (Magic UI style) */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(rgba(148, 163, 184, 0.25) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Gentle Floating Teal & Blue Ambient Light Cones (Aceternity style) */}
      <div
        className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-40 bg-gradient-to-br from-blue-400/25 via-teal-300/20 to-transparent"
        style={{
          animation: 'pulseGlow 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-10 -right-20 w-[450px] h-[450px] rounded-full blur-3xl opacity-35 bg-gradient-to-bl from-teal-400/20 via-blue-300/15 to-transparent"
        style={{
          animation: 'pulseGlow 10s ease-in-out infinite reverse',
        }}
      />

      {/* Gentle Floating Abstract Shapes in Soft Cyan/Teal */}
      <div
        className="absolute top-8 right-1/3 w-32 h-32 rounded-full border border-blue-200/40 opacity-20 pointer-events-none"
        style={{ animation: 'floatGentle 9s ease-in-out infinite' }}
      />
      <div
        className="absolute -bottom-8 left-12 w-48 h-48 rounded-full border border-teal-200/40 opacity-25 pointer-events-none"
        style={{ animation: 'floatGentle 11s ease-in-out infinite reverse' }}
      />

      {/* Light Radial Gradient Mask so the pattern softly fades at edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/70" />
    </div>
  );
}

export default HeroAmbientBeams;
