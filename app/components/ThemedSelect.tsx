import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '../utils/cn.js';
import { Button } from './ui/button.js';

type Option = {
  value: string;
  label: string;
};

type ThemedSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[] | ReadonlyArray<Option>;
  placeholder?: string;
  label?: string;
  clearable?: boolean;
};

export function ThemedSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
  clearable = true,
}: ThemedSelectProps) {
  const optionsWithClear = clearable
    ? [{ value: undefined, label: '-' }, ...options]
    : options;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medieval text-muted-foreground">
          {label}
        </label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onChange}>
        <SelectPrimitive.Trigger
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors duration-200',
            value ? 'text-foreground' : 'text-muted-foreground',
            'relative'
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder}>
            {options.find((opt) => opt.value === value)?.label || placeholder}
          </SelectPrimitive.Value>
          <div className="flex items-center gap-2">
            {clearable && value && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange('');
                }}
                className="rounded-full p-1 hover:bg-muted absolute right-8"
              >
                ×
              </button>
            )}
            <SelectPrimitive.Icon>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </SelectPrimitive.Icon>
          </div>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
            <SelectPrimitive.Viewport className="p-1">
              {optionsWithClear.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value as string}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    'transition-colors duration-200'
                  )}
                >
                  <SelectPrimitive.ItemText>
                    {option.label}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
