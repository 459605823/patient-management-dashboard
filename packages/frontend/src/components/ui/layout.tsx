import type { ComponentProps } from 'react';
import workspacePlus from '@/assets/workspace-plus.svg';

export function DashboardLayout({ children, className = '', ...props }: ComponentProps<'main'>) {
  return (
    <div>
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex min-h-14 w-[calc(100%-2rem)] max-w-7xl items-center justify-between gap-4 py-3 md:min-h-16 md:w-[calc(100%-4rem)] md:py-0">
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
