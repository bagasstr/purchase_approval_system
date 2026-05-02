import { prisma } from '@/lib/prisma';
import { RequestStatus } from '../../../../generated/prisma/enums';

export const PurchaseRequestRepository = {
  async getAll() {
    return await prisma.purchaseRequest.findMany({
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
  },

  async getById(id: string) {
    return await prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        requester: true,
        department: true,
        items: true,
        approvals: {
          include: {
            actor: true,
          },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });
  },

  async getByUser(userId: string) {
    return await prisma.purchaseRequest.findMany({
      where: { userId },
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
  },

  async getByDepartment(departmentId: string) {
    return await prisma.purchaseRequest.findMany({
      where: { departmentId },
      include: {
        requester: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createRequest(data: any) {
    const newRequest = await prisma.purchaseRequest.create({
      data: {
        requestNo: data.requestNo,
        title: data.title,
        description: data.description,
        totalAmount: data.totalAmount,
        status: RequestStatus.PENDING,

        requester: {
          connect: { id: data.userId },
        },
        department: {
          connect: { id: data.departmentId },
        },
        items: {
          create: data.items,
        },
        approvals: {
          create: data.approvals.map((app: any) => ({
            stepOrder: app.stepOrder,
            action: app.action || 'PENDING',
            roleId: app.roleId,
          })),
        },
      },
      include: {
        approvals: {
          include: { role: true },
        },
      },
    });


    const firstStep = newRequest.approvals.find((s) => s.stepOrder === 1);
    if (firstStep) {
      const targetUsers = await prisma.user.findMany({
        where: { roleId: firstStep.roleId },
      });

      for (const targetUser of targetUsers) {

        if (firstStep.role.name.toLowerCase().includes('manager')) {
          if (targetUser.departmentId !== newRequest.departmentId) continue;
        }

        await prisma.notification.create({
          data: {
            userId: targetUser.id,
            title: 'Pengajuan Baru',
            message: `Terdapat pengajuan baru "${newRequest.title}" yang memerlukan persetujuan Anda.`,
            type: 'warning',
            link: '/dashboard/approvals',
          },
        });
      }
    }

    return newRequest;
  },

  async updateStatus(id: string, status: RequestStatus) {
    return await prisma.purchaseRequest.update({
      where: { id },
      data: { status },
    });
  },
};
