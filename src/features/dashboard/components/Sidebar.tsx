'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Building2, LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { MENU_GROUPS } from '../constants/menu.config';
import type { ServerUser } from '@/types/server-user';

interface SidebarProps {
  serverUser: ServerUser;
}

export function Sidebar({ serverUser }: SidebarProps) {
  const pathname = usePathname();

  // Menu filtering using server-provided data — no extra fetches
  const filteredMenuGroups = useMemo(() => {
    return MENU_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true;
        if (serverUser.isAdmin) return true;

        const userPerms = serverUser.permissions;
        if (Array.isArray(item.permission)) {
          return item.permission.some((p) => userPerms.includes(p));
        }
        return userPerms.includes(item.permission);
      }),
    })).filter((group) => group.items.length > 0);
  }, [serverUser]);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/signin';
        },
      },
    });
  };

  return (
    <aside className='w-64 h-screen bg-zinc-950 text-white border-r border-zinc-800 flex flex-col p-6 fixed left-0 top-0 z-40'>
      <div className='flex-1 overflow-y-auto no-scrollbar'>
        <div className='flex items-center gap-2.5 px-2 py-3 mb-6'>
          <Building2 className='w-6 h-6 text-primary' />
          <span className='text-xl font-bold tracking-tight'>Approva</span>
        </div>

        <div className='space-y-4'>
          {filteredMenuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className='space-y-1.5'>
              <span className='px-3 text-[10px] font-bold tracking-wider text-zinc-500 uppercase'>
                {group.label}
              </span>
              <nav className='space-y-0.5'>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900',
                      )}
                    >
                      <item.icon className='w-4 h-4' />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className='border-t border-zinc-800 pt-4'>
        <div className='flex items-center gap-3 px-2 mb-2'>
          <div className='w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase'>
            {serverUser.name?.substring(0, 2) || '??'}
          </div>
          <div className='flex flex-col overflow-hidden leading-tight'>
            <span className='text-xs font-semibold text-zinc-200 truncate'>
              {serverUser.name}
            </span>
            <span className='text-[9px] text-zinc-500 truncate'>
              {serverUser.departmentName || 'Belum ditentukan'}
            </span>
            <span className='text-[8px] font-bold text-primary-foreground mt-0.5 tracking-tight'>
              Limit: Rp{' '}
              {Number(serverUser.approvalLimit || 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className='flex items-center gap-3 px-3 py-2 w-full rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors'
        >
          <LogOut className='w-4 h-4' />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
