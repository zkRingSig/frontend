import React from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'relative transition-transform duration-300 hover:scale-[1.01]',
      className
    )}>
      {children}
    </div>
  );
}