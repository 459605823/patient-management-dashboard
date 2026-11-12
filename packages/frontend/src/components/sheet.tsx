import * as Dialog from '@radix-ui/react-dialog';
import type { ComponentProps } from 'react';

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
      <Dialog.Overlay className="fixed inset-0 z-20 animate-sheet-fade bg-slate-900/35 motion-reduce:animate-none" />
      <Dialog.Content
        className={`fixed inset-y-0 right-0 z-21 flex h-dvh w-full max-w-140 animate-sheet-slide flex-col bg-white shadow-[-8px_0_32px_rgb(15_23_41/0.12)] outline-none motion-reduce:animate-none ${className}`}
        {...props}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
