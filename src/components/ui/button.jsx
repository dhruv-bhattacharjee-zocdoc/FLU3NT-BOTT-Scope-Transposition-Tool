import React from 'react';

export function Button({ children, variant = 'default', className = '', onClick, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
    ghost: 'hover:bg-neutral-100 hover:text-neutral-900',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.default} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
