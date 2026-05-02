'use server';

import { PurchaseRequestService } from '../services/purchaseRequest.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { hasPermission } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

const sanitizeRequest = (req: any) => ({
  ...req,
  totalAmount: Number(req.totalAmount || 0),
  requester: req.requester
    ? {
        ...req.requester,
        approvalLimit: Number(req.requester.approvalLimit || 0),
        createdAt: req.requester.createdAt?.toISOString() || null,
        updatedAt: req.requester.updatedAt?.toISOString() || null,
      }
    : null,
  items: req.items?.map((item: any) => ({
    ...item,
    unitPrice: Number(item.unitPrice || 0),
    subtotal: Number(item.subtotal || 0),
  })),
  approvals: req.approvals?.map((step: any) => ({
    ...step,
    actor: step.actor
      ? {
          ...step.actor,
          approvalLimit: Number(step.actor.approvalLimit || 0),
          createdAt: step.actor.createdAt?.toISOString() || null,
          updatedAt: step.actor.updatedAt?.toISOString() || null,
        }
      : null,
    actedAt: step.actedAt?.toISOString() || null,
    createdAt: step.createdAt?.toISOString() || null,
    updatedAt: step.updatedAt?.toISOString() || null,
  })),
  createdAt: req.createdAt?.toISOString() || null,
  updatedAt: req.updatedAt?.toISOString() || null,
});

export async function getAllRequestsAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const user = session.user as any;


    const userFull = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    const userPermissions = userFull?.role?.permissions || [];
    const roleName = userFull?.role?.name?.toLowerCase() || '';
    const isAdmin =
      roleName === 'admin' ||
      roleName === 'super-admin' ||
      userPermissions.includes('user:all');

    const isManager =
      roleName.includes('manager') ||
      userPermissions.includes('purchase-request:approve-manager');


    const whereClause: any = {};
    if (!isAdmin) {
      if (isManager) {
        whereClause.departmentId = user.departmentId;
      } else {
        whereClause.userId = user.id;
      }
    }

    const requests = await prisma.purchaseRequest.findMany({
      where: whereClause,
      include: {
        requester: true,
        department: true,
        items: true,
        approvals: {
          include: { role: true, actor: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((req: any) => sanitizeRequest(req));
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil data request.');
  }
}

export async function createRequestAction(data: {
  title: string;
  description?: string;
  items: {
    itemName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error('Anda harus login terlebih dahulu.');
    }

    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    const deptId = (session.user as any).departmentId;
    if (!deptId) {
      throw new Error(
        'Akun Anda belum memiliki departemen. Silakan hubungi admin.',
      );
    }

    const newRequest = await PurchaseRequestService.createRequest(
      session.user.id,
      deptId,
      {
        ...data,
        totalAmount,
      },
    );

    return {
      success: true,
      data: sanitizeRequest(newRequest),
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal membuat request.' };
  }
}
export async function updateRequestItemsAction(
  requestId: string,
  items: { id: string; unitPrice: number }[],
) {
  try {
    if (!(await hasPermission('purchase-request:approve-procurement-survey'))) {
      throw new Error('Anda tidak memiliki izin untuk survey harga.');
    }

    await prisma.$transaction(async (tx) => {
      let totalAmount = 0;


      for (const item of items) {
        const currentItem = await tx.purchaseItem.findFirst({
          where: { id: item.id, purchaseRequestId: requestId },
          select: { quantity: true },
        });

        if (!currentItem) {
          throw new Error('Item tidak ditemukan pada request ini.');
        }

        const subtotal = currentItem.quantity * item.unitPrice;
        totalAmount += subtotal;

        await tx.purchaseItem.update({
          where: { id: item.id },
          data: {
            unitPrice: item.unitPrice,
            subtotal,
          },
        });
      }


      await tx.purchaseRequest.update({
        where: { id: requestId },
        data: { totalAmount },
      });
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal update harga barang.',
    };
  }
}
