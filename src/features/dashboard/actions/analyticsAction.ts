'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export interface AnalyticsData {
  monthlySpending: { month: string; total: number }[];
  departmentSpending: { name: string; total: number }[];
  statusDistribution: { name: string; value: number }[];
  summary: {
    totalSpent: number;
    avgRequestValue: number;
    successRate: number;
    totalRequests: number;
  };
}

export const getAnalyticsAction = async (): Promise<AnalyticsData> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error('Anda harus login terlebih dahulu');
    }


    const approvedRequests = await prisma.purchaseRequest.findMany({
      where: { status: 'APPROVED' },
      select: {
        totalAmount: true,
        createdAt: true,
        department: { select: { name: true } },
      },
    });


    const monthlyMap = new Map<string, number>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    approvedRequests.forEach(req => {
      const date = new Date(req.createdAt);
      const monthLabel = months[date.getMonth()];
      monthlyMap.set(monthLabel, (monthlyMap.get(monthLabel) || 0) + Number(req.totalAmount));
    });


    const currentMonth = new Date().getMonth();
    const monthlySpending = [];
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      const label = months[mIdx];
      monthlySpending.push({ month: label, total: monthlyMap.get(label) || 0 });
    }


    const deptMap = new Map<string, number>();
    approvedRequests.forEach(req => {
      const name = req.department.name;
      deptMap.set(name, (deptMap.get(name) || 0) + Number(req.totalAmount));
    });
    const departmentSpending = Array.from(deptMap.entries()).map(([name, total]) => ({ name, total }));


    const statusCounts = await prisma.purchaseRequest.groupBy({
      by: ['status'],
      _count: { id: true },
    });
    const statusDistribution = statusCounts.map(s => ({
      name: s.status === 'APPROVED' ? 'Disetujui' : s.status === 'REJECTED' ? 'Ditolak' : 'Pending',
      value: s._count.id,
    }));


    const totalRequests = await prisma.purchaseRequest.count();
    const totalSpent = approvedRequests.reduce((sum, r) => sum + Number(r.totalAmount), 0);
    const approvedCount = approvedRequests.length;
    const rejectedCount = await prisma.purchaseRequest.count({ where: { status: 'REJECTED' } });
    
    const avgRequestValue = approvedCount > 0 ? totalSpent / approvedCount : 0;
    const successRate = totalRequests > 0 ? (approvedCount / (approvedCount + rejectedCount)) * 100 : 0;

    return {
      monthlySpending,
      departmentSpending,
      statusDistribution,
      summary: {
        totalSpent,
        avgRequestValue,
        successRate: Math.round(successRate),
        totalRequests,
      },
    };
  } catch (error) {
    console.error('Analytics Error:', error);
    throw new Error('Gagal memuat data analitik');
  }
};
