'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getExportDataAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const requests = await prisma.purchaseRequest.findMany({
      include: {
        requester: { select: { name: true } },
        department: { select: { name: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });


    const flattenedData: any[] = [];
    
    requests.forEach(req => {
      req.items.forEach(item => {
        flattenedData.push({
          'No. Request': req.requestNo,
          'Pemohon': req.requester.name,
          'Divisi': req.department.name,
          'Nama Barang': item.itemName,
          'Jumlah': item.quantity,
          'Harga Satuan': Number(item.unitPrice),
          'Total PR': Number(req.totalAmount),
          'Status': req.status,
          'Tanggal': req.createdAt.toISOString().split('T')[0],
        });
      });
    });

    return flattenedData;
  } catch (error) {
    console.error('Export Error:', error);
    throw new Error('Gagal mengambil data untuk export');
  }
}
