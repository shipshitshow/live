'use client';

import * as React from 'react';
import { cn } from './cn';

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'flex h-10 w-full rounded-xl border border-surface-border bg-surface-card px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-accent-red/40 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
