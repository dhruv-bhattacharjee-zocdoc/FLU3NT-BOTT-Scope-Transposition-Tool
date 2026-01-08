import React, { useState } from 'react';

export function TooltipProvider({ children }) {
  return <>{children}</>;
}

export function Tooltip({ children }) {
  return <>{children}</>;
}

export function TooltipTrigger({ children, asChild = false }) {
  return children;
}

export function TooltipContent({ children, side = 'top', align = 'center', className = '', ...props }) {
  const [isVisible, setIsVisible] = useState(false);

  // This is a simplified tooltip - in production you'd want a proper portal-based tooltip
  return (
    <div 
      className={`absolute z-50 rounded-md border bg-neutral-950 text-neutral-50 px-3 py-1.5 text-sm opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none ${className}`}
      style={{
        [side]: '100%',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
