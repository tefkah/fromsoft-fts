import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../utils/cn.js';

interface ThemedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export function ThemedInput({ className, type, ...props }: ThemedInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          type === 'search' && 'pl-9',
          'transition-colors duration-200',
          className
        )}
        {...props}
      />
    </div>
  );
}
