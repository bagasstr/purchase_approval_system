'use client';

import { cn } from '@/lib/utils';
import { Bell, Check, Info, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '../actions/notificationAction';
import { useNotifications } from '../hooks/useNotifications';

export default function Notification() {
  const {
    isOpen,
    setIsOpen,
    notifications,
    loading,
    mounted,
    dropdownRef,
    unreadCount,
    handleNotifClick,
    markAllAsRead,
  } = useNotifications();

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <Check className='w-4 h-4 text-emerald-500' />;
      case 'warning':
        return <AlertTriangle className='w-4 h-4 text-amber-500' />;
      case 'error':
        return <AlertCircle className='w-4 h-4 text-red-500' />;
      default:
        return <Info className='w-4 h-4 text-blue-500' />;
    }
  };

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <Button
        variant='ghost'
        size='icon-lg'
        className='relative rounded-full hover:bg-muted'
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className='w-5 h-5 hover:text-zinc-100 transition-colors' />
        {mounted && unreadCount > 0 && (
          <span className='absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500' />
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className='absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100'>
          <div className='flex items-center justify-between p-4 border-b border bg-background/50'>
            <span className='text-sm font-semibold text-foreground'>
              Notifikasi
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className='text-[11px] text-foreground hover:text-muted-foreground font-medium transition-colors'
              >
                Tandai dibaca semua
              </button>
            )}
          </div>

          <div className='divide-y divide-muted max-h-80 overflow-y-auto'>
            {loading ? (
              <div className='p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2'>
                <Loader2 className='w-3 h-3 animate-spin' /> Sedang memuat...
              </div>
            ) : notifications.length === 0 ? (
              <div className='p-6 text-center text-xs text-muted-foreground'>
                Tidak ada notifikasi baru.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotifClick(item)}
                  className={cn(
                    'p-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-muted/80',
                    item.isRead ? 'opacity-60' : 'bg-muted/50',
                  )}
                >
                  <div className='mt-0.5 flex-shrink-0'>
                    {getIcon(item.type)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-foreground flex items-center justify-between gap-2'>
                      {item.title}
                      {!item.isRead && (
                        <span className='w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0' />
                      )}
                    </p>
                    <p className='text-xs mt-0.5 leading-relaxed break-words'>
                      {item.message}
                    </p>
                    <span className='text-[10px] mt-1 block text-muted-foreground'>
                      {item.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
