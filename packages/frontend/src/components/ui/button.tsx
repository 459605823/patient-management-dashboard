import type { ComponentProps } from 'react';
import './button.css';

export function PmdButton({
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
      className={`pmd-button pmd-button--${variant} pmd-button--${size} ${className}`}
      {...props}
    />
  );
}
