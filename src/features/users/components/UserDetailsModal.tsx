'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserAction } from '@/features/users/actions/userSettingsAction';
import { toast } from 'sonner';
import { Shield, Building, Wallet, Mail } from 'lucide-react';

interface UserDetailsModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  roles: any[];
  departments: any[];
}

export function UserDetailsModal({
  user,
  isOpen,
  onClose,
  roles,
  departments,
}: UserDetailsModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    roleId: user?.roleId || null,
    departmentId: user?.departmentId || null,
    approvalLimit: user?.approvalLimit || 0,
  });

  // Sinkronisasi data pas user berubah
  useEffect(() => {
    if (user) {
      setFormData({
        roleId: user.roleId || null,
        departmentId: user.departmentId || null,
        approvalLimit: user.approvalLimit || 0,
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data: any) => updateUserAction(user.id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Profil user berhasil di-update!');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        onClose();
      } else {
        toast.error(res.error);
      }
    },
  });

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            Edit Profil Pengguna
          </DialogTitle>
          <DialogDescription>
            Atur hak akses dan batasan persetujuan untuk {user.name}.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-6 py-4'>
          {/* Info Singkat */}
          <div className='flex items-center gap-4 p-3 bg-muted/50 rounded-lg border border-dashed'>
            <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary'>
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className='font-bold text-sm'>{user.name}</p>
              <p className='text-xs text-muted-foreground flex items-center gap-1'>
                <Mail className='w-3 h-3' /> {user.email}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className='grid gap-2'>
            <Label className='flex items-center gap-2 text-xs font-semibold'>
              <Shield className='w-3 h-3' /> Role / Hak Akses
            </Label>
            <Select
              value={formData.roleId || undefined}
              onValueChange={(val: any) =>
                setFormData({ ...formData, roleId: val || null })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Pilih Role' />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className='grid gap-2'>
            <Label className='flex items-center gap-2 text-xs font-semibold'>
              <Building className='w-3 h-3' /> Departemen / Divisi
            </Label>
            <Select
              value={formData.departmentId || 'none'}
              onValueChange={(val: any) =>
                setFormData({
                  ...formData,
                  departmentId: val === 'none' ? null : val,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Pilih Departemen' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>Tanpa Divisi</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Approval Limit */}
          <div className='grid gap-2'>
            <Label className='flex items-center gap-2 text-xs font-semibold'>
              <Wallet className='w-3 h-3' /> Batas Persetujuan (Approval Limit)
            </Label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold'>
                Rp
              </span>
              <Input
                type='number'
                className='pl-10'
                value={formData.approvalLimit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    approvalLimit: Number(e.target.value),
                  })
                }
              />
            </div>
            <p className='text-[10px] text-muted-foreground'>
              Nominal maksimal yang bisa di-approve oleh user ini.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
          <Button
            onClick={() => mutation.mutate(formData)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
