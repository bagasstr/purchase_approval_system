'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export interface DashboardStats {
  totalRequests: number;
  pendingApprovals: number;
  approvedRequests: number;
  totalSpent: number;
  recentRequests: any[];
  departmentSpending: { name: string; amount: number; percentage: number }[];
}

export const getDashboardStatsAction = async (): Promise<DashboardStats> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const user = session.user as any;
    const userDepartmentId = user.departmentId;

    // 1. Ambil data user lengkap buat dapet list permissions
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

    // 2. Tentukan filter berdasarkan role
    const whereClause: any = {};
    if (!isAdmin) {
      if (isManager) {
        whereClause.departmentId = userDepartmentId;
      } else {
        whereClause.userId = user.id;
      }
    }

    // 3. Hitung stats dasar dengan filter
    const [total, pending, approved, allApproved] = await Promise.all([
      prisma.purchaseRequest.count({ where: whereClause }),
      prisma.purchaseRequest.count({ where: { ...whereClause, status: 'PENDING' } }),
      prisma.purchaseRequest.count({ where: { ...whereClause, status: 'APPROVED' } }),
      prisma.purchaseRequest.findMany({
        where: { ...whereClause, status: 'APPROVED' },
        select: { totalAmount: true },
      }),
    ]);

    const totalSpent = allApproved.reduce((sum, item) => sum + Number(item.totalAmount), 0);

    // 4. Ambil 5 request terbaru dengan filter
    const recentRequestsRaw = await prisma.purchaseRequest.findMany({
      where: whereClause,
      include: {
        requester: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentRequests = recentRequestsRaw.map(req => ({
      id: req.requestNo,
      item: req.title,
      user: req.requester.name,
      dept: req.department.name,
      amount: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(req.totalAmount)),
      status: req.status === 'APPROVED' ? 'Approved' : req.status === 'REJECTED' ? 'Rejected' : 'Pending',
    }));

    // 5. Analisis pengeluaran per divisi (tetep buat admin, ato cuma divisi dia buat manager)
    const departments = await prisma.department.findMany({
      where: isAdmin ? {} : { id: userDepartmentId || 'none' },
      include: {
        purchaseRequests: {
          where: { status: 'APPROVED', ...(isAdmin ? {} : { userId: isManager ? undefined : user.id }) },
          select: { totalAmount: true },
        },
      },
    });

    let totalAllDept = 0;
    const deptSpending = departments.map(dept => {
      const amount = dept.purchaseRequests.reduce((sum, pr) => sum + Number(pr.totalAmount), 0);
      totalAllDept += amount;
      return { name: dept.name, amount };
    });

    const finalDeptSpending = deptSpending.map(dept => ({
      ...dept,
      percentage: totalAllDept > 0 ? Math.round((dept.amount / totalAllDept) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalRequests: total,
      pendingApprovals: pending,
      approvedRequests: approved,
      totalSpent,
      recentRequests,
      departmentSpending: finalDeptSpending,
    };
  } catch (error) {
    console.error('Dashboard Error:', error);
    throw new Error('Gagal mengambil data dashboard');
  }
};
