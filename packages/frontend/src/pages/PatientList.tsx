import { useEffect, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/ui/layout';
import { PmdButton } from '@/components/ui/button';
import plus from '@/assets/plus.svg';

export function PatientList() {
  const heading = useRef<HTMLHeadingElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  return (
    <>
      <DashboardLayout>
        <div className="mb-7 flex flex-wrap items-start justify-between gap-5 md:mb-10 md:flex-nowrap md:gap-6">
          <div>
            <h1
              ref={heading}
              tabIndex={-1}
              className="text-[28px] leading-normal font-semibold tracking-[-.65px] md:text-[32px]"
            >
              Patients
            </h1>
            <p className="mt-1 text-base leading-6 text-muted">Manage patient information.</p>
          </div>
          <PmdButton ref={addButton} className="w-full min-w-44 md:w-auto">
            <img src={plus} width="24" height="24" alt="" />
            Add patient
          </PmdButton>
        </div>
      </DashboardLayout>
    </>
  );
}
