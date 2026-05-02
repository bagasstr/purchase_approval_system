'use client';

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, FileText } from 'lucide-react';
import type { AnalyticsData } from '@/features/dashboard/actions/analyticsAction';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      {}
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

      {}
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

      {}
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

      {}
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
  );
}
