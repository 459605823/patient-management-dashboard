import type { ComponentProps } from 'react';
import workspacePlus from '@/assets/workspace-plus.svg';
import './layout.css';

export function DashboardLayout({ children, className = '', ...props }: ComponentProps<'main'>) {
  return (
    <div>
      <header className="border-b border-border bg-white">
        <div className="dashboard-header-content">
          <div className="flex items-center gap-2 text-sm font-semibold md:gap-3 md:text-base">
            <span className="dashboard-logo">
              <img src={workspacePlus} width="20" height="20" alt="" />
            </span>
            <span>Patient workspace</span>
          </div>
        </div>
      </header>
      <main className={`dashboard-main ${className}`} {...props}>
        {children}
      </main>
    </div>
  );
}
