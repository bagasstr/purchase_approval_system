'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
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

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

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

      // Load xlsx dynamically to keep initial bundle small
      const XLSX = await import('xlsx');
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths (wch: characters)
      const wscols = [
        { wch: 15 }, // No. Request
        { wch: 15 }, // Pemohon
        { wch: 10 }, // Divisi
        { wch: 25 }, // Nama Barang
        { wch: 8 },  // Jumlah
        { wch: 18 }, // Harga Satuan
        { wch: 18 }, // Total PR
        { wch: 10 }, // Status
        { wch: 12 }, // Tanggal
      ];
      ws['!cols'] = wscols;

      // Apply currency format to 'Harga Satuan' (F) and 'Total PR' (G)
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Column F (Harga Satuan)
        const cellF = ws[XLSX.utils.encode_cell({ r: R, c: 5 })];
        if (cellF) cellF.z = '"Rp"#,##0';
        
        // Column G (Total PR)
        const cellG = ws[XLSX.utils.encode_cell({ r: R, c: 6 })];
        if (cellG) cellG.z = '"Rp"#,##0';
      }

      // Create workbook and append worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pengadaan');

      // Export file
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

      {/* Summary Cards */}
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

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Monthly Trend */}
        <Card className='p-6'>
          <CardHeader className='px-0 pt-0'>
            <CardTitle className='text-base font-semibold'>Tren Pengeluaran Bulanan</CardTitle>
            <CardDescription>Visualisasi pengeluaran 6 bulan terakhir.</CardDescription>
          </CardHeader>
          <div className='h-[300px] mt-4'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={data.monthlySpending}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis dataKey='month' axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10 }} 
                  width={60}
                  tickFormatter={(val) => new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(val)} 
                />
                <Tooltip 
                  formatter={(value: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Line type='monotone' dataKey='total' stroke='#3b82f6' strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Spending */}
        <Card className='p-6'>
          <CardHeader className='px-0 pt-0'>
            <CardTitle className='text-base font-semibold'>Pengeluaran Per Divisi</CardTitle>
            <CardDescription>Distribusi anggaran yang telah digunakan.</CardDescription>
          </CardHeader>
          <div className='h-[300px] mt-4'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={data.departmentSpending} layout='vertical'>
                <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                <XAxis type='number' hide />
                <YAxis dataKey='name' type='category' axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey='total' fill='#10b981' radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card className='p-6'>
          <CardHeader className='px-0 pt-0'>
            <CardTitle className='text-base font-semibold'>Status Pengajuan</CardTitle>
            <CardDescription>Perbandingan jumlah status permintaan saat ini.</CardDescription>
          </CardHeader>
          <div className='h-[300px] mt-4 flex items-center justify-center'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey='value'
                >
                  {data.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend verticalAlign='bottom' height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Tips/Insights */}
        <Card className='p-6 flex flex-col justify-between bg-zinc-900 border-zinc-800'>
          <div>
            <CardTitle className='text-base font-semibold text-white'>Insight Pengadaan</CardTitle>
            <CardDescription className='text-zinc-400 mt-2'>Rangkuman cerdas dari data perusahaan Anda.</CardDescription>
            <div className='mt-6 space-y-4'>
              <div className='flex gap-3 items-start'>
                <div className='p-2 rounded-full bg-emerald-500/10 text-emerald-500'>
                  <TrendingUp className='w-4 h-4' />
                </div>
                <p className='text-sm text-zinc-300'>Pengeluaran bulan ini naik <span className='text-emerald-500 font-bold'>12%</span> dibandingkan bulan lalu. Pastikan budget aman.</p>
              </div>
              <div className='flex gap-3 items-start'>
                <div className='p-2 rounded-full bg-blue-500/10 text-blue-500'>
                  <FileText className='w-4 h-4' />
                </div>
                <p className='text-sm text-zinc-300'>Divisi <span className='text-blue-500 font-bold'>Engineering</span> masih menjadi penyerap anggaran terbesar yaitu 55%.</p>
              </div>
            </div>
          </div>
          <Button variant='link' className='text-zinc-400 hover:text-white p-0 justify-start h-auto'>
            Lihat laporan detail &rarr;
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
