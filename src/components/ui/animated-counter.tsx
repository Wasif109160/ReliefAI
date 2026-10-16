'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AnimatedCounterProps {
  value: string | number;
  duration?: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  className = '',
  decimals: propDecimals,
  prefix: propPrefix,
  suffix: propSuffix,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    const p = propPrefix || '';
    const s = propSuffix || '';
    return `${p}${value}${s}`;
  });
  const hasAnimatedRef = useRef(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const fullStr = `${propPrefix || ''}${value}${propSuffix || ''}`;

    if (prefersReducedMotion) {
      requestAnimationFrame(() => setDisplayValue(fullStr));
      return;
    }

    const strValue = String(value);

    // Extract numerical portions and non-numerical prefix/suffix
    // Handles formats like "1,420,000", "89.4k", "৳ 25.0 Crore", "0.8 km", "184 Units"
    const match = strValue.match(/^([^0-9.]*)([0-9,.]+)(.*)$/);

    if (!match) {
      requestAnimationFrame(() => setDisplayValue(fullStr));
      return;
    }

    const prefix = propPrefix !== undefined ? propPrefix : match[1];
    const rawNumStr = match[2].replace(/,/g, '');
    const suffix = propSuffix !== undefined ? propSuffix : match[3];
    const targetNum = parseFloat(rawNumStr);

    if (isNaN(targetNum)) {
      requestAnimationFrame(() => setDisplayValue(fullStr));
      return;
    }

    const isFloat = rawNumStr.includes('.');
    const decimals = propDecimals !== undefined ? propDecimals : (isFloat ? rawNumStr.split('.')[1].length : 0);
    const hasCommas = match[2].includes(',');

    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easedProgress = easeOutExpo(progress);
      const currentNum = targetNum * easedProgress;

      let formattedNum = currentNum.toFixed(decimals);
      if (hasCommas) {
        const parts = formattedNum.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formattedNum = parts.join('.');
      }

      setDisplayValue(`${prefix}${formattedNum}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(strValue);
      }
    };

    // Use IntersectionObserver to start animation when visible in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          animationFrameId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, propDecimals, propPrefix, propSuffix]);

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  );
}

export default AnimatedCounter;
