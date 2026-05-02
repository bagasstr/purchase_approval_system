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
  Search,
  UserPlus,
  Shield,
  Building,
  Mail,
  MoreHorizontal,
  Edit,
  Trash2,
  Ban,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { UserService } from '@/features/users/services/user.service';

import {
  assignDepartmentAction,
  getAllDepartmentAction,
} from '@/features/departments/actions/departmentAction';
import { getAllRoleAction } from '@/features/roles/actions/rolesAction';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsersAction,
  deleteUserAction,
} from '@/features/users/actions/userAction';
import { toggleUserStatusAction } from '@/features/users/actions/userSettingsAction';
import AddUserForm from '@/features/users/components/AddUserForm';
import { UserDetailsModal } from '@/features/users/components/UserDetailsModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserManagementPage = () => {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Queries
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getAllUsersAction(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getAllDepartmentAction(),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getAllRoleAction(),
  });

  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) =>
      toggleUserStatusAction(id, !banned),
    onSuccess: () => {
      toast.success('Status user berhasil diubah!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserAction(id),
    onSuccess: () => {
      toast.success('User berhasil dihapus!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleEdit = (u: any) => {
    setSelectedUser(u);
    setIsEditOpen(true);
  };

  const loading = isUsersLoading;

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
        <Loader2 className='w-8 h-8 animate-spin mb-2' />
        <p>Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Manajemen Pengguna
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Kelola hak akses, divisi, dan batasan persetujuan seluruh anggota
            tim.
          </p>
        </div>
        <AddUserForm />
      </div>

      <Card className='backdrop-blur-sm bg-card/80 border-zinc-200/50 dark:border-zinc-800/50'>
        <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6'>
          <div>
            <CardTitle className='text-base font-semibold'>
              Daftar Anggota
            </CardTitle>
            <CardDescription className='text-xs'>
              Total {users?.length} pengguna terdaftar dalam sistem.
            </CardDescription>
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Cari user...'
              className='w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse text-sm'>
              <thead>
                <tr className='border-b text-muted-foreground text-xs font-medium uppercase tracking-wider'>
                  <th className='pb-3 px-3'>Profil / Email</th>
                  <th className='pb-3 px-3'>Divisi</th>
                  <th className='pb-3 px-3'>Role</th>
                  <th className='pb-3 px-3'>Approval Limit</th>
                  <th className='pb-3 px-3 text-right'>Aksi</th>
                </tr>
              </thead>
              <tbody className='divide-y border-zinc-100 dark:border-zinc-800/60'>
                {users?.map((u: any, i: number) => (
                  <tr
                    key={i}
                    className={cn(
                      'hover:bg-muted/30 transition-colors',
                      u.email === session?.user.email && 'bg-primary/5',
                    )}
                  >
                    <td className='py-4 px-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary border border-primary/20'>
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className='font-bold text-sm text-foreground flex items-center gap-2'>
                            {u.name}
                            {u.banned && (
                              <span className='px-1.5 py-0.5 bg-red-100 text-red-700 text-[8px] rounded uppercase font-black'>
                                Banned
                              </span>
                            )}
                          </p>
                          <span className='text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5'>
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className='py-4 px-3'>
                      <span className='inline-flex items-center gap-1.5 text-[11px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800/50 text-foreground border rounded-md font-semibold'>
                        <Building className='w-3 h-3 text-muted-foreground' />
                        {u.department?.name || 'UMUM'}
                      </span>
                    </td>
                    <td className='py-4 px-3'>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-black border uppercase tracking-tight',
                          u?.role?.name === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : u?.role?.name === 'MANAGER'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200',
                        )}
                      >
                        {u?.role?.name || 'USER'}
                      </span>
                    </td>
                    <td className='py-4 px-3 font-mono text-xs font-bold'>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(u.approvalLimit || 0)}
                    </td>
                    <td className='py-4 px-3 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8 text-xs'
                          onClick={() => handleEdit(u)}
                        >
                          <Edit className='w-3 h-3 mr-2' /> Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                            >
                              <MoreHorizontal className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-48'>
                            <DropdownMenuLabel>Aksi Lanjutan</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='cursor-pointer'
                              onClick={() =>
                                toggleStatusMutation.mutate({
                                  id: u.id,
                                  banned: u.banned,
                                })
                              }
                            >
                              <Ban className='w-4 h-4 mr-2' />
                              <span>
                                {u.banned ? 'Aktifkan Akun' : 'Suspend Akun'}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='cursor-pointer text-destructive focus:text-destructive'
                              onClick={() => {
                                if (confirm('Yakin mau hapus user ini?'))
                                  deleteMutation.mutate(u.id);
                              }}
                            >
                              <Trash2 className='w-4 h-4 mr-2' />
                              <span>Hapus Akun</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <UserDetailsModal
        key={selectedUser?.id}
        user={selectedUser}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        roles={roles}
        departments={departments}
      />
    </>
  );
};

export default UserManagementPage;
