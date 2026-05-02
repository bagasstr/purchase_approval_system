'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const [departments, setDepartments] = useState([
    'Engineering',
    'Operations',
    'Creative',
    'Finance',
  ]);
  const [newDept, setNewDept] = useState('');

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.trim()) return;

    if (departments.includes(newDept.trim())) {
      toast.error('Department udah ada!');
      return;
    }

    setDepartments((prev) => [...prev, newDept.trim()]);
    setNewDept('');
    toast.success('Department baru berhasil ditambahkan!');
  };

  const handleDeleteDept = (dept: string) => {
    setDepartments((prev) => prev.filter((d) => d !== dept));
    toast.success(`${dept} dihapus dari master data.`);
  };

  return (
    <>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            System Settings
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Konfigurasi data organisasi dan aturan aplikasi di sini.
          </p>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {}
        <Card className='backdrop-blur-sm bg-card/80 border-zinc-200/50 dark:border-zinc-800/50 flex flex-col justify-between'>
          <CardHeader>
            <CardTitle className='text-base font-semibold flex items-center gap-2'>
              <Building className='w-4 h-4 text-primary' /> Master Data
              Department
            </CardTitle>
            <CardDescription className='text-xs'>
              Tambah atau hapus divisi yang aktif di perusahaan lu.
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            {}
            <form onSubmit={handleAddDept} className='flex items-center gap-2'>
              <input
                type='text'
                placeholder='Contoh: Marketing'
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className='flex-1 px-3 py-1.5 text-xs bg-transparent border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
              />
              <Button type='submit' size='sm' className='h-8'>
                <Plus className='w-3 h-3 mr-1' /> Tambah
              </Button>
            </form>

            {}
            <div className='border rounded-md divide-y border-zinc-100 dark:border-zinc-800/60'>
              {departments.map((dept, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between p-3 text-sm text-foreground hover:bg-muted/30 transition-colors'
                >
                  <span className='font-medium'>{dept}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20'
                    onClick={() => handleDeleteDept(dept)}
                  >
                    <Trash2 className='w-3.5 h-3.5' />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {}
        <Card className='backdrop-blur-sm bg-card/80 border-zinc-200/50 dark:border-zinc-800/50'>
          <CardHeader>
            <CardTitle className='text-base font-semibold flex items-center gap-2'>
              <ShieldAlert className='w-4 h-4 text-amber-500' /> Kebijakan
              Aplikasi
            </CardTitle>
            <CardDescription className='text-xs'>
              Atur limitasi workflow pengadaan barang.
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-4 text-sm'>
            <div className='p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-md text-amber-800 dark:text-amber-400 text-xs'>
              <p className='font-bold flex items-center gap-1.5 mb-1'>
                <ShieldAlert className='w-3.5 h-3.5' />
                Approval Workflow:
              </p>
              Semua request yang memiliki nominal di atas **Rp 5.000.000**
              diwajibkan melewati tahap approval Manager terlebih dahulu sebelum
              diteruskan ke bagian Procurement.
            </div>

            <div className='pt-2'>
              <label className='block text-xs font-semibold mb-1.5 text-muted-foreground'>
                Nama Organisasi
              </label>
              <input
                type='text'
                defaultValue='PT. Approva Sukses Makmur'
                className='w-full px-3 py-2 text-xs bg-muted/50 border border-input rounded-md text-foreground focus:outline-none cursor-not-allowed'
                disabled
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SettingsPage;
