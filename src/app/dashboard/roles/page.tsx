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
  Shield,
  Plus,
  Trash2,
  Users,
  Search,
  FolderOpen,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createRoleAction,
  deleteRoleAction,
  getAllRoleAction,
} from '@/features/roles/actions/rolesAction';
import { AddRoleForm } from '@/features/roles/components/AddRoleForm';

const RolesPage = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [editingRole, setEditingRole] = useState<any | null>(null);

  useEffect(() => {
    const result = async () => {
      try {
        const res = await getAllRoleAction();
        setRoles(res);
      } catch (error: any) {
        toast.error(error.message || 'Gagal memuat data role.');
      }
    };
    result();
  }, []);

  const handleRoleCreated = (newRole: any) => {
    if (editingRole) {
      setRoles((prev) => prev.map((r) => (r.id === newRole.id ? newRole : r)));
      setEditingRole(null);
    } else {
      setRoles((prev) => [newRole, ...prev]);
    }
  };

  const handleEditRole = (role: any) => {
    setEditingRole(role);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
  };

  const handleDeleteRole = async (id: string) => {
    try {
      const res = await deleteRoleAction(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      toast.success(`Role ${res?.name} telah dihapus.`);
    } catch (error: any) {
      toast.error(error.message || `Role gagal dihapus.`);
    }
  };

  return (
    <>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Role Management
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Atur dan kelola semua tingkatan jabatan / role di organisasi lu.
          </p>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {}
        <AddRoleForm
          onSuccess={handleRoleCreated}
          editData={editingRole}
          onCancel={handleCancelEdit}
        />

        {}
        <Card className='md:col-span-2 backdrop-blur-sm bg-card/80 border-zinc-200/50 dark:border-zinc-800/50'>
          <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6'>
            <div>
              <CardTitle className='text-base font-semibold flex items-center gap-2'>
                <FolderOpen className='w-4 h-4 text-zinc-400' /> Daftar Role
              </CardTitle>
              <CardDescription className='text-xs'>
                Total ada role aktif.
              </CardDescription>
            </div>
            <div className='relative w-full sm:w-64'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <input
                type='text'
                placeholder='Cari role...'
                className='w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2'>
              {roles.map((role) => (
                <div
                  key={role.id}
                  className='p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-muted/20 hover:bg-muted/40 transition-all duration-200 flex items-center justify-between'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
                      <Shield className='w-5 h-5' />
                    </div>
                    <div>
                      <p className='font-semibold text-sm text-foreground uppercase tracking-tight'>
                        {role.name}
                      </p>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {role.permissions?.map((p: string) => (
                          <span
                            key={p}
                            className='text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-muted-foreground rounded border border-zinc-200/50 dark:border-zinc-700/50'
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      <span className='text-[10px] text-muted-foreground flex items-center gap-1 mt-1.5'>
                        <Users className='w-3 h-3' /> {role._count?.users || 0}{' '}
                        Pengguna terdaftar
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-muted-foreground hover:text-primary'
                      onClick={() => handleEditRole(role)}
                    >
                      <Pencil className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20'
                      onClick={() => handleDeleteRole(role?.id)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {roles.length === 0 && (
              <div className='text-center py-12 text-sm text-muted-foreground'>
                Tidak ada role yang terdaftar.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RolesPage;
