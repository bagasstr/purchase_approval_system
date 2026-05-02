import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getNotificationsAction,
  NotificationItem,
  markAllAsReadAction,
  markAsReadAction,
} from '../actions/notificationAction';

export const useNotifications = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await getNotificationsAction();
      setNotifications(data);
    } catch (error) {
      console.error('Gagal narik notif:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotifClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await markAsReadAction(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    }

    if (item.link) {
      router.push(item.link);
      setIsOpen(false);
    }
  };

  const markAllAsRead = async () => {
    await markAllAsReadAction();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return {
    isOpen,
    setIsOpen,
    notifications,
    loading,
    mounted,
    dropdownRef,
    unreadCount,
    handleNotifClick,
    markAllAsRead,
  };
};
