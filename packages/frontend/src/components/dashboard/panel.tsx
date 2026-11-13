import type { CreatePatientData } from '@pmd/shared';
import { useCallback, useRef, useState } from 'react';
import { PmdButton } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { PatientForm } from './form';
import { DiscardChangesDialog } from './DiscardChangesDialog';
import './panel.css';

export type PatientPanelState = { mode: 'closed' } | { mode: 'create' };

export function PatientPanel({
  panel,
  onClose,
  onCreate,
  restoreFocus,
}: {
  panel: PatientPanelState;
  onClose: () => void;
  onCreate: (data: CreatePatientData) => Promise<void>;
  restoreFocus: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const dirty = useRef(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const setDirty = useCallback((value: boolean) => {
    dirty.current = value;
  }, []);
  const setBusy = useCallback((value: boolean) => {
    savingRef.current = value;
    setSaving(value);
  }, []);
  function close() {
    if (savingRef.current) return;
    if (dirty.current) setConfirmExit(true);
    else onClose();
  }
  return (
    <Sheet
      open={panel.mode === 'create'}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => {
          if (savingRef.current) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          restoreFocus();
        }}
        onOpenAutoFocus={(event) => {
          const first = document.querySelector<HTMLInputElement>(
            '[role="dialog"] form input[autocomplete="given-name"]',
          );
          if (first) {
            event.preventDefault();
            first.focus();
          }
        }}
      >
        <header className="patient-panel-header">
          <SheetTitle className="text-xl leading-7.5 font-semibold">Add patient</SheetTitle>
          <PmdButton
            variant="ghost"
            size="icon"
            className="text-muted"
            aria-label="Close form"
            disabled={saving}
            onClick={close}
          >
            <span aria-hidden="true">×</span>
          </PmdButton>
        </header>
        <SheetDescription className="sr-only">
          Enter the patient’s personal information, status and address.
        </SheetDescription>
        <PatientForm
          onSubmit={onCreate}
          onCancel={close}
          onSavingChange={setBusy}
          onDirtyChange={setDirty}
        />
        <DiscardChangesDialog
          open={confirmExit}
          onKeepEditing={() => setConfirmExit(false)}
          onDiscard={() => {
            setConfirmExit(false);
            onClose();
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
