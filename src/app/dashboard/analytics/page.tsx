'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Wallet,
  TrendingUp,
  FileText,
  Activity,
  Loader2,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAnalyticsAction, AnalyticsData } from '@/features/dashboard/actions/analyticsAction';
import { getExportDataAction } from '@/features/dashboard/actions/exportAction';
import { toast } from 'sonner';

// Lazy load recharts components — saves ~386KB from initial bundle
const RechartsComponents = dynamic(
  () => import('@/features/dashboard/components/AnalyticsCharts'),
  {
    loading: () => (
      <div className='flex items-center justify-center py-20 text-muted-foreground'>
        <Loader2 className='w-6 h-6 animate-spin mr-2' />
        <span>Memuat grafik...</span>
      </div>
    ),
    ssr: false,
  },
);

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAnalyticsAction();
        setData(result);
      } catch (error) {
        console.error('Gagal fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const exportData = await getExportDataAction();
      
      if (exportData.length === 0) {
        toast.error('Tidak ada data untuk di-export.');
        return;
      }

      const XLSX = await import('xlsx');

      const ws = XLSX.utils.json_to_sheet(exportData);

      const wscols = [
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
        { wch: 25 },
        { wch: 8 },
        { wch: 18 },
        { wch: 18 },
        { wch: 10 },
        { wch: 12 },
      ];
      ws['!cols'] = wscols;

      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        const cellF = ws[XLSX.utils.encode_cell({ r: R, c: 5 })];
        if (cellF) cellF.z = '"Rp"#,##0';
        
        const cellG = ws[XLSX.utils.encode_cell({ r: R, c: 6 })];
        if (cellG) cellG.z = '"Rp"#,##0';
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pengadaan');

      XLSX.writeFile(wb, `Laporan_Pengadaan_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Laporan Excel (.xlsx) berhasil di-download.');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal export laporan.');
    } finally {
      setExporting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
        <Loader2 className='w-8 h-8 animate-spin mb-2' />
        <p>Menganalisis data pengadaan...</p>
      </div>
    );
  }

  const summaryStats = [
    {
      title: 'Total Pengeluaran',
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0, notation: 'compact' }).format(data.summary.totalSpent),
      icon: Wallet,
      desc: 'Total PR yang disetujui',
      color: 'text-blue-500',
    },
    {
      title: 'Rata-rata Pengajuan',
      value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0, notation: 'compact' }).format(data.summary.avgRequestValue),
      icon: TrendingUp,
      desc: 'Nilai per pengajuan',
      color: 'text-emerald-500',
    },
    {
      title: 'Tingkat Persetujuan',
      value: `${data.summary.successRate}%`,
      icon: Activity,
      desc: 'Rasio Approved vs Rejected',
      color: 'text-amber-500',
    },
    {
      title: 'Total Permintaan',
      value: data.summary.totalRequests.toString(),
      icon: FileText,
      desc: 'Jumlah seluruh PR',
      color: 'text-purple-500',
    },
  ];

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>Statistik & Analitik</h1>
          <p className='text-sm text-muted-foreground mt-1'>Laporan mendalam pengeluaran dan kinerja pengadaan perusahaan.</p>
        </div>
        <Button 
          variant='outline' 
          className='gap-2' 
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? <Loader2 className='w-4 h-4 animate-spin' /> : <Download className='w-4 h-4' />}
          {exporting ? 'Mengekspor...' : 'Export Laporan'}
        </Button>
      </div>

      {}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {summaryStats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground mt-1'>{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {}
      <RechartsComponents data={data} />
    </div>
  );
};

export default AnalyticsPage;
