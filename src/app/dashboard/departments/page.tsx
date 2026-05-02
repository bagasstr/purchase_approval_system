'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Building2,
  Plus,
  Trash2,
  Users,
  Search,
  FolderOpen,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  deleteDepartmentAction,
  getAllDepartmentAction,
} from '@/features/departments/actions/departmentAction';
import { AddDeptForm } from '@/features/departments/components/AddDeptForm';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [editingDepartment, setEditingDepartment] = useState<any | null>(null);

  useEffect(() => {
    const fetchDept = async () => {
      try {
        const res = await getAllDepartmentAction();
        setDepartments(res);
      } catch (error: any) {
        toast.error(error.message || 'Gagal memuat data department.');
      }
    };
    fetchDept();
  }, []);

  const handleDeptCreated = (newDept: any) => {
    if (editingDepartment) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === newDept.id ? newDept : d))
      );
      setEditingDepartment(null);
    } else {
      setDepartments((prev) => [newDept, ...prev]);
    }
  };

  const handleEditDept = (dept: any) => {
    setEditingDepartment(dept);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingDepartment(null);
  };

  const handleDeleteDept = async (id: string) => {
    try {
      const res = await deleteDepartmentAction(id);
      setDepartments((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Divisi ${res?.name} telah dihapus.`);
    } catch (error: any) {
      toast.error(error.message || `Divisi gagal dihapus.`);
    }
  };

  return (
    <>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Department Management
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Atur dan kelola semua divisi/departemen di organisasi lu.
          </p>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <AddDeptForm 
          onSuccess={handleDeptCreated} 
          editData={editingDepartment}
          onCancel={handleCancelEdit}
        />

        {}
        <Card className='md:col-span-2 backdrop-blur-sm bg-card/80 border-zinc-200/50 dark:border-zinc-800/50'>
          <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6'>
            <div>
              <CardTitle className='text-base font-semibold flex items-center gap-2'>
                <FolderOpen className='w-4 h-4 text-zinc-400' /> Daftar Divisi
              </CardTitle>
              <CardDescription className='text-xs'>
                Total ada {departments.length} divisi aktif.
              </CardDescription>
            </div>
            <div className='relative w-full sm:w-64'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <input
                type='text'
                placeholder='Cari divisi...'
                className='w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2'>
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className='p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-muted/20 hover:bg-muted/40 transition-all duration-200 flex items-center justify-between'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
                      <Building2 className='w-5 h-5' />
                    </div>
                    <div>
                      <p className='font-semibold text-sm text-foreground'>
                        {dept.name}
                      </p>
                      <span className='text-xs text-muted-foreground flex items-center gap-1 mt-0.5'>
                        <Users className='w-3 h-3' /> {dept._count?.users || 0}{' '}
                        Karyawan
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleEditDept(dept)}
                      className='h-8 w-8 text-muted-foreground hover:text-primary'
                    >
                      <Pencil className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleDeleteDept(dept.id)}
                      className='h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20'
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {departments.length === 0 && (
              <div className='text-center py-12 text-sm text-muted-foreground'>
                Tidak ada department yang terdaftar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DepartmentsPage;
