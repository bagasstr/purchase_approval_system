'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ApprovalUpdateData } from '../repository/Approvals.repository';
import { ApprovalsServices } from '../services/Approvals.service';

type ApprovalClientUpdateData = Omit<ApprovalUpdateData, 'actorId'>;

const sanitizeApproval = (item: any) => ({
  ...item,
  purchaseRequest: {
    ...item.purchaseRequest,
    totalAmount: Number(item.purchaseRequest.totalAmount || 0),
    requester: item.purchaseRequest.requester
      ? {
          ...item.purchaseRequest.requester,
          approvalLimit: Number(item.purchaseRequest.requester.approvalLimit || 0),
          createdAt: item.purchaseRequest.requester.createdAt?.toISOString() || null,
          updatedAt: item.purchaseRequest.requester.updatedAt?.toISOString() || null,
        }
      : null,
    items: item.purchaseRequest.items?.map((i: any) => ({
      ...i,
      unitPrice: Number(i.unitPrice || 0),
      subtotal: Number(i.subtotal || 0),
    })),
    approvals: item.purchaseRequest.approvals?.map((step: any) => ({
      ...step,
      role: step.role,
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
  },
  actor: item.actor
    ? {
        ...item.actor,
        approvalLimit: Number(item.actor.approvalLimit || 0),
        createdAt: item.actor.createdAt?.toISOString() || null,
        updatedAt: item.actor.updatedAt?.toISOString() || null,
      }
    : null,
  actedAt: item.actedAt ? item.actedAt.toISOString() : null,
  createdAt: item.createdAt?.toISOString() || null,
  updatedAt: item.updatedAt?.toISOString() || null,
});

export const getMyApprovalsAction = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const user = session.user as any;
    const userRoleId = user.roleId;
    const userDepartmentId = user.departmentId;

    // Ambil data user lengkap buat dapet list permissions-nya
    const userFull = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    const userPermissions = userFull?.role?.permissions || [];
    const allApprovals = await ApprovalsServices.getAllApprovals();

    // Group approvals by purchaseRequestId to find the current turn
    const prGroups: Record<string, any[]> = {};
    allApprovals.forEach((app: any) => {
      if (!prGroups[app.purchaseRequestId]) {
        prGroups[app.purchaseRequestId] = [];
      }
      prGroups[app.purchaseRequestId].push(app);
    });

    const filtered = allApprovals.filter((app: any) => {
      // 1. Ambil permission apa aja yang dipunya sama role yang ditargetin di step ini
      const targetRolePermissions = app.role?.permissions || [];
      const hasMatchingPermission = targetRolePermissions.some(
        (p: string) => p.includes('approve') && userPermissions.includes(p),
      );

      if (!hasMatchingPermission && app.roleId !== userRoleId) return false;

      // Filter dasar: Jangan tampilkan PENDING kalo PR-nya udah REJECTED
      if (app.action === 'PENDING' && app.purchaseRequest.status === 'REJECTED') {
        return false;
      }

      // Khusus Manager: Cek departemen
      const roleName = app.role?.name?.toLowerCase() || '';
      if (roleName.includes('manager')) {
        return app.purchaseRequest.departmentId === userDepartmentId;
      }

      return true;
    });

    // Grouping by PR to ensure "1 data aja" per PR
    const groupedResults: Record<string, any> = {};
    
    filtered.forEach((app: any) => {
      const prId = app.purchaseRequestId;
      const existing = groupedResults[prId];
      
      // Ambil semua tahapan buat PR ini yang relevan buat user ini
      const userStepsForThisPR = filtered.filter(a => a.purchaseRequestId === prId);
      const hasAnyPending = userStepsForThisPR.some(s => s.action === 'PENDING');
      
      if (!existing) {
        // Kalo ada yang PENDING buat user ini di PR ini, prioritaskan status PENDING
        if (hasAnyPending) {
          const firstPending = userStepsForThisPR.find(s => s.action === 'PENDING');
          groupedResults[prId] = firstPending;
        } else {
          // Jika tidak ada yang pending, ambil step paling akhir (APPROVED/REJECTED)
          const latestStep = userStepsForThisPR.sort((a, b) => b.stepOrder - a.stepOrder)[0];
          groupedResults[prId] = latestStep;
        }
      }
    });

    const finalResults = Object.values(groupedResults);

    return finalResults.map((item: any) => sanitizeApproval(item));
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil data persetujuan');
  }
};

export const getAllApprovalsAction = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const canViewAllApprovals = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    const roleName = canViewAllApprovals?.role?.name?.toLowerCase() || '';
    const permissions = canViewAllApprovals?.role?.permissions || [];
    const isPrivileged =
      roleName === 'admin' ||
      roleName === 'super-admin' ||
      permissions.includes('user:all');

    if (!isPrivileged) {
      throw new Error('Anda tidak memiliki izin untuk melihat seluruh approval.');
    }

    const result = await ApprovalsServices.getAllApprovals();
    return result.map((item: any) => sanitizeApproval(item));
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil data');
  }
};

export const getApprovalById = async (id: string) => {
  try {
    const result: any = await ApprovalsServices.getApprovalById(id);
    return sanitizeApproval(result);
  } catch (error: any) {
    throw new Error(error.message || `Gagal mengambil data ${id}`);
  }
};

export const updateApprovalAction = async (
  id: string,
  data: ApprovalClientUpdateData,
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const actorId = session.user.id;

    // 1. Cek apakah ini beneran gilirannya step ini
    const step = await prisma.approvalStep.findUnique({
      where: { id },
      include: {
        role: true,
        purchaseRequest: { include: { approvals: { include: { role: true } } } },
      },
    });

    if (!step) throw new Error('Tahap approval tidak ditemukan');

    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      include: { role: true },
    });

    if (!actor) {
      throw new Error('User tidak ditemukan');
    }

    const actorPermissions = actor.role?.permissions || [];
    const stepPermissions = step.role?.permissions || [];
    const hasRoleAccess = actor.roleId === step.roleId;
    const hasPermissionAccess = stepPermissions.some((permission) =>
      actorPermissions.includes(permission),
    );

    if (!hasRoleAccess && !hasPermissionAccess) {
      throw new Error('Anda tidak memiliki izin untuk memproses tahap ini.');
    }

    if (
      step.role?.name?.toLowerCase().includes('manager') &&
      actor.departmentId !== step.purchaseRequest.departmentId
    ) {
      throw new Error(
        'Anda tidak dapat memproses pengajuan lintas departemen pada tahap manager.',
      );
    }

    const prSteps = step.purchaseRequest.approvals.sort(
      (a, b) => a.stepOrder - b.stepOrder,
    );

    const currentActiveStep = prSteps.find((s) => s.action === 'PENDING');

    if (step.purchaseRequest.status === 'REJECTED') {
      throw new Error('Pengajuan ini telah ditolak dan tidak dapat diproses lebih lanjut.');
    }

    if (currentActiveStep?.id !== id) {
      throw new Error('Saat ini bukan giliran Anda untuk menyetujui tahap ini. Mohon tunggu proses sebelumnya selesai.');
    }

    const result: any = await ApprovalsServices.updateApproval(id, {
      ...data,
      actorId,
    });
    return sanitizeApproval(result);
  } catch (error: any) {
    throw new Error(error.message || 'Gagal update approval');
  }
};
