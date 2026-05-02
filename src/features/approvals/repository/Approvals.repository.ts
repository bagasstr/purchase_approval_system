import { ApprovalAction } from './../../../../generated/prisma/enums';
import { prisma } from '@/lib/prisma';

export interface ApprovalUpdateData {
  action: ApprovalAction;
  actorId: string;
  remarks?: string;
}

export const ApprovalsRepository = {
  async getAllApprovals() {
    return await prisma.approvalStep.findMany({
      include: {
        role: true,
        purchaseRequest: {
          include: {
            requester: true,
            department: true,
            items: true,
            approvals: {
              include: {
                role: true,
                actor: true,
              },
            },
          },
        },
        actor: true,
      },
    });
  },
  async getAprovalById(id: string) {
    return await prisma.approvalStep.findUnique({
      where: { id },
      include: {
        role: true,
        purchaseRequest: {
          include: {
            requester: true,
            department: true,
            items: true,
            approvals: {
              include: {
                role: true,
                actor: true,
              },
            },
          },
        },
        actor: true,
      },
    });
  },
  async updateApproval(id: string, data: ApprovalUpdateData) {
    return await prisma.$transaction(async (tx) => {
      const updatedStep = await tx.approvalStep.update({
        where: { id },
        data: {
          action: data.action,
          actorId: data.actorId,
          remarks: data.remarks,
          actedAt: new Date(),
        },
        include: {
          role: true,
          purchaseRequest: {
            include: {
              requester: true,
              department: true,
              items: true,
              approvals: {
                include: {
                  role: true,
                  actor: true,
                },
              },
            },
          },
          actor: true,
        },
      });

      const prId = updatedStep.purchaseRequestId;
      const allSteps = updatedStep.purchaseRequest.approvals;


      if (data.action === 'REJECTED') {
        await tx.purchaseRequest.update({
          where: { id: prId },
          data: { status: 'REJECTED' },
        });


        await tx.notification.create({
          data: {
            userId: updatedStep.purchaseRequest.userId,
            title: 'Pengajuan Ditolak',
            message: `Pengajuan "${updatedStep.purchaseRequest.title}" telah ditolak oleh ${updatedStep.role.name}.`,
            type: 'error',
            link: '/dashboard/requests',
          },
        });
      }

      else if (data.action === 'APPROVED') {
        const isAllApproved = allSteps.every((s) =>
          s.id === id ? true : s.action === 'APPROVED',
        );

        if (isAllApproved) {
          await tx.purchaseRequest.update({
            where: { id: prId },
            data: { status: 'APPROVED' },
          });


          await tx.user.update({
            where: { id: updatedStep.purchaseRequest.userId },
            data: {
              approvalLimit: {
                decrement: updatedStep.purchaseRequest.totalAmount,
              },
            },
          });


          await tx.notification.create({
            data: {
              userId: updatedStep.purchaseRequest.userId,
              title: 'Pengajuan Selesai',
              message: `Pengajuan "${updatedStep.purchaseRequest.title}" telah disetujui untuk semua tahapan.`,
              type: 'success',
              link: '/dashboard/requests',
            },
          });
        } else {

          await tx.notification.create({
            data: {
              userId: updatedStep.purchaseRequest.userId,
              title: 'Pembaruan Status Pengajuan',
              message: `Pengajuan "${updatedStep.purchaseRequest.title}" telah disetujui oleh ${updatedStep.role.name}.`,
              type: 'info',
              link: '/dashboard/requests',
            },
          });


          const nextStep = allSteps
            .sort((a, b) => a.stepOrder - b.stepOrder)
            .find((s) => s.action === 'PENDING');

          if (nextStep) {

            const targetUsers = await tx.user.findMany({
              where: { roleId: nextStep.roleId },
            });

            for (const targetUser of targetUsers) {

              if (nextStep.role.name.toLowerCase().includes('manager')) {
                if (
                  targetUser.departmentId !==
                  updatedStep.purchaseRequest.departmentId
                )
                  continue;
              }

              await tx.notification.create({
                data: {
                  userId: targetUser.id,
                  title: 'Perlu Persetujuan',
                  message: `Terdapat pengajuan "${updatedStep.purchaseRequest.title}" yang memerlukan persetujuan Anda.`,
                  type: 'warning',
                  link: '/dashboard/approvals',
                },
              });
            }
          }
        }
      }

      return updatedStep;
    });
  },
};
