import * as Dialog from '@radix-ui/react-dialog';
import type { ComponentProps } from 'react';
import './sheet.css';

export const Sheet = Dialog.Root;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;

export function SheetContent({
  children,
  className = '',
  ...props
}: ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="pmd-sheet-overlay" />
      <Dialog.Content className={`pmd-sheet-content ${className}`} {...props}>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
