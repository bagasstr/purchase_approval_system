'use client';

import Notification from '@/features/dashboard/components/Notification';

export function Header() {
  return (
    <header className='w-full h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm z-30 sticky top-0'>
      {}
      <div className='flex items-center gap-4'>
        {}
      </div>

      {}
      <div className='flex items-center gap-4'>
        <Notification />
      </div>
    </header>
  );
}
