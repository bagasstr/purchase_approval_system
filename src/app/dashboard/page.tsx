'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  FileText,
  Clock,
  CheckCircle,
  Wallet,
  TrendingUp,
  Search,
  MoreVertical,
  ArrowRight,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getDashboardStatsAction,
  DashboardStats,
} from '@/features/dashboard/actions/dashboardAction';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const stats = await getDashboardStatsAction();
      setData(stats);
    } catch (error) {
      console.error('Gagal fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !data) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
        <Loader2 className='w-8 h-8 animate-spin mb-2' />
        <p>Menyiapkan data dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Requests',
      value: data.totalRequests.toLocaleString('id-ID'),
      desc: 'Semua pengajuan',
      icon: FileText,
      iconClass:
        'text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800',
    },
    {
      title: 'Pending Approval',
      value: data.pendingApprovals.toLocaleString('id-ID'),
      desc: 'Perlu tindakan',
      icon: Clock,
      iconClass:
        'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50',
    },
    {
      title: 'Approved',
      value: data.approvedRequests.toLocaleString('id-ID'),
      desc: 'Telah disetujui',
      icon: CheckCircle,
      iconClass:
        'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50',
    },
    {
      title: 'Total Spent',
      value: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
        notation: 'compact',
      }).format(data.totalSpent),
      desc: 'Anggaran terpakai',
      icon: Wallet,
      iconClass:
        'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50',
    },
  ];

  return (
    <>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Dashboard Pengadaan
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Kelola seluruh pengeluaran divisi Anda di sini.
          </p>
        </div>
      </div>

      {}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8'>
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium'>
                {stat.title}
              </CardTitle>
              <div className={cn('p-2 rounded-md', stat.iconClass)}>
                <stat.icon className='w-4 h-4' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground flex items-center gap-1 mt-1'>
                <TrendingUp className='w-3 h-3' /> {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {}
      <div className='grid gap-4 lg:grid-cols-3'>
        {}
        <Card className='lg:col-span-2'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <div>
              <CardTitle className='text-base font-semibold'>
                Permintaan Terbaru
              </CardTitle>
              <CardDescription className='text-xs'>
                Pantau pengajuan barang terbaru dari divisi Anda.
              </CardDescription>
            </div>
            <div className='relative w-48'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <input
                type='text'
                placeholder='Cari permintaan...'
                className='w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full text-left border-collapse text-sm'>
                <thead>
                  <tr className='border-b text-muted-foreground text-xs font-medium'>
                    <th className='pb-2 px-2'>ID / Item</th>
                    <th className='pb-2 px-2'>User / Dept</th>
                    <th className='pb-2 px-2'>Jumlah</th>
                    <th className='pb-2 px-2'>Status</th>
                    <th className='pb-2 px-2 text-right'>Aksi</th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {data.recentRequests.map((req, i) => (
                    <tr key={i} className='hover:bg-muted/50'>
                      <td className='py-3 px-2'>
                        <span className='text-xs text-muted-foreground'>
                          {req.id}
                        </span>
                        <p className='font-medium text-sm'>{req.item}</p>
                      </td>
                      <td className='py-3 px-2'>
                        <p className='font-medium text-xs'>{req.user}</p>
                        <span className='text-[10px] text-muted-foreground uppercase'>
                          {req.dept}
                        </span>
                      </td>
                      <td className='py-3 px-2 font-semibold text-xs'>
                        {req.amount}
                      </td>
                      <td className='py-3 px-2'>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                            req.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800',
                          )}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className='py-3 px-2 text-right'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() => router.push('/dashboard/requests')}
                        >
                          <MoreVertical className='w-4 h-4' />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground'>
              <span>
                Menampilkan {data.recentRequests.length} permintaan terbaru
              </span>
              <button
                onClick={() => router.push('/dashboard/requests')}
                className='text-primary hover:underline font-medium inline-flex items-center gap-1'
              >
                Lihat Semua <ArrowRight className='w-3 h-3' />
              </button>
            </div>
          </CardContent>
        </Card>

        {}
        <Card className='flex flex-col justify-between'>
          <CardHeader>
            <CardTitle className='text-base font-semibold'>
              Ringkasan Analisis
            </CardTitle>
            <CardDescription className='text-xs'>
              Alokasi anggaran divisi Anda saat ini.
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            <div className='space-y-4'>
              {data.departmentSpending.length === 0 ? (
                <p className='text-xs text-muted-foreground text-center py-10'>
                  Belum ada data pengeluaran.
                </p>
              ) : (
                data.departmentSpending.map((dept, i) => (
                  <div key={i}>
                    <div className='flex justify-between text-xs font-medium mb-1'>
                      <span>{dept.name}</span>
                      <span className='text-muted-foreground'>
                        {dept.percentage}%
                      </span>
                    </div>
                    <div className='w-full h-2 bg-secondary rounded-full overflow-hidden'>
                      <div
                        className={cn(
                          'h-full rounded-full',
                          i === 0
                            ? 'bg-primary'
                            : i === 1
                              ? 'bg-amber-500'
                              : 'bg-emerald-500',
                        )}
                        style={{ width: `${dept.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {data.departmentSpending.some((d) => d.percentage > 70) && (
              <div className='bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 p-3 rounded-md flex items-start gap-2 text-amber-800 dark:text-amber-400'>
                <AlertCircle className='w-4 h-4 mt-0.5 flex-shrink-0' />
                <div className='text-xs'>
                  <span className='font-semibold'>Peringatan Anggaran: </span>
                  Pengeluaran beberapa divisi sudah mendekati limit bulanan.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardPage;
