'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ApprovalsServices } from '@/features/approvals/services/Approvals.service';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
}

export const getNotificationsAction = async (): Promise<NotificationItem[]> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) return [];

    const user = session.user as any;

    const dbNotifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return dbNotifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      time: n.createdAt.toLocaleString('id-ID'),
      type: n.type as any,
      isRead: n.isRead,
      link: n.link || undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
};

export const markAllAsReadAction = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) return;

    const user = session.user as any;

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
  }
};

export const markAsReadAction = async (id: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const userId = session.user.id;
    const updated = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    if (updated.count === 0) {
      throw new Error('Notifikasi tidak ditemukan atau bukan milik Anda.');
    }
  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
};
