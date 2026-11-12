import type { ComponentProps } from 'react';
import workspacePlus from '@/assets/workspace-plus.svg';

export function DashboardLayout({ children, className = '', ...props }: ComponentProps<'main'>) {
  return (
    <div>
      <header className="min-h-18 border-b border-border bg-white md:h-16 md:min-h-0">
        <div className="mx-auto flex h-full w-[calc(100%-2rem)] max-w-7xl flex-col items-start justify-center gap-0.75 py-3 md:w-[calc(100%-4rem)] md:flex-row md:items-center md:justify-between md:gap-4 md:py-0">
          <div className="flex items-center gap-2 text-sm font-semibold md:gap-3 md:text-base">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary md:size-7 md:rounded-[7px]">
              <img src={workspacePlus} width="20" height="20" alt="" />
            </span>
            <span>Patient workspace</span>
          </div>
        </div>
      </header>
      <main
        className={`mx-auto my-7 w-[calc(100%-2rem)] max-w-7xl md:my-12 md:w-[calc(100%-4rem)] ${className}`}
        {...props}
      >
        {children}
      </main>
    </div>
  );
}
