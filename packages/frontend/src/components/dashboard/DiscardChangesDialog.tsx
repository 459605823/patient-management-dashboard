import * as Dialog from '@radix-ui/react-dialog';
import { useRef } from 'react';
import { PmdButton } from '@/components/ui/button';

export function DiscardChangesDialog({
  open,
  onKeepEditing,
  onDiscard,
}: {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  const keepEditing = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onKeepEditing();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-slate-900/40" />
        <Dialog.Content
          role="alertdialog"
          className="fixed top-1/2 left-1/2 z-31 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-white p-6 shadow-xl outline-none"
          onPointerDownOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            opener.current =
              document.activeElement instanceof HTMLElement ? document.activeElement : null;
            keepEditing.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (opener.current?.isConnected) opener.current.focus();
          }}
        >
          <Dialog.Title className="text-xl font-semibold">Discard changes?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-muted">
            Your unsaved changes will be lost.
          </Dialog.Description>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <PmdButton ref={keepEditing} variant="secondary" onClick={onKeepEditing}>
              Keep editing
            </PmdButton>
            <PmdButton variant="destructive" onClick={onDiscard}>
              Discard changes
            </PmdButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
