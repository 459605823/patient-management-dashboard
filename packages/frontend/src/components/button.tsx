import type { ComponentProps } from 'react';

const variants = {
  primary: 'border-transparent bg-primary text-white enabled:hover:bg-primary-hover',
  destructive: 'border-transparent bg-red-700 text-white enabled:hover:bg-red-800',
  secondary: 'border-border bg-white text-ink enabled:hover:bg-slate-100',
  ghost: 'border-transparent bg-transparent enabled:hover:bg-slate-100',
};

const sizes = {
  default: 'px-4 py-2.25 font-medium leading-6 whitespace-nowrap',
  icon: 'size-11 shrink-0 p-0 text-[27px] font-normal whitespace-nowrap',
  table:
    'px-0 py-2 text-xs leading-4.5 font-medium whitespace-normal md:px-2 md:py-2.25 md:text-sm md:leading-6 md:whitespace-nowrap',
};

export function Button({
  className = '',
  variant = 'primary',
  size = 'default',
  type = 'button',
  ...props
}: ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'icon' | 'table';
}) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
