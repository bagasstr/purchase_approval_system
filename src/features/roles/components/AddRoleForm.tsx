'use client';

import { toast } from 'sonner';
import z from 'zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { createRoleAction, updateRoleAction } from '@/features/roles/actions/rolesAction';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

const roleSchema = z.object({
  name: z.string().min(2, 'Role harus diisi'),
  permissions: z.array(z.string()).min(1, 'Pilih minimal satu permission'),
});

type Input = z.input<typeof roleSchema>;

const AVAILABLE_PERMISSIONS = [
  { id: 'user:all', label: 'Kelola User' },
  { id: 'role:all', label: 'Kelola Role' },
  { id: 'department:all', label: 'Kelola Divisi' },
  { id: 'purchase-request:create', label: 'Buat Request' },
  { id: 'purchase-request:approve-manager', label: 'Approve Level Manager' },
  {
    id: 'purchase-request:approve-procurement-survey',
    label: 'Procurement: Survey Harga',
  },
  { id: 'purchase-request:approve-finance', label: 'Approve Level Finance' },
  {
    id: 'purchase-request:approve-procurement-purchase',
    label: 'Procurement: Beli Barang',
  },
  { id: 'purchase-request:pay', label: 'Bayar Request' },
  { id: 'purchase-request:view-all', label: 'Lihat Semua Request' },
];

interface AddRoleFormProps {
  onSuccess: (newRole: any) => void;
  editData?: any;
  onCancel?: () => void;
}

export const AddRoleForm = ({
  onSuccess,
  editData,
  onCancel,
}: AddRoleFormProps) => {
  const { control, handleSubmit, reset, setValue, watch } = useForm<Input>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      permissions: [],
    },
  });

  useEffect(() => {
    if (editData) {
      reset({
        name: editData.name,
        permissions: editData.permissions,
      });
    } else {
      reset({
        name: '',
        permissions: [],
      });
    }
  }, [editData, reset]);

  const selectedPermissions = watch('permissions');

  const togglePermission = (id: string) => {
    const current = [...selectedPermissions];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setValue('permissions', current, { shouldValidate: true });
  };

  const handleAddRole: SubmitHandler<Input> = async (data) => {
    try {
      let result;
      if (editData) {

        result = await updateRoleAction(editData.id, data);
        toast.success(`Role ${data.name.toUpperCase()} berhasil di-update!`);
      } else {

        result = await createRoleAction({
          name: data.name,
          permissions: data.permissions,
        });
        toast.success(`Role ${data.name.toUpperCase()} berhasil dibuat!`);
      }

      onSuccess({ ...result, _count: editData?._count || { users: 0 } });
      reset();
      if (onCancel) onCancel();
    } catch (error: any) {
      toast.error(error.message || `Gagal memproses role!`);
    }
  };

  return (
    <Card className='md:col-span-1 backdrop-blur-sm bg-card/80 border-zinc-200/50 dark:border-zinc-800/50 h-fit'>
      <CardHeader>
        <CardTitle className='text-base font-semibold flex items-center gap-2'>
          <Plus className='w-4 h-4 text-primary' />{' '}
          {editData ? 'Edit Role' : 'Buat Baru'}
        </CardTitle>
        <CardDescription className='text-xs'>
          {editData
            ? 'Ubah hak akses untuk role ini.'
            : 'Tambahkan role baru dan tentukan hak aksesnya.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleAddRole)} className='space-y-6'>
          <FieldGroup>
            <Controller
              name={'name'}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Nama Role</FieldLabel>
                  <Input
                    type='text'
                    placeholder='Contoh: SUPERVISOR'
                    className='w-full px-3 py-2 bg-transparent border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring'
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>

          <div className='space-y-3'>
            <FieldLabel className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
              Hak Akses (Permissions)
            </FieldLabel>
            <div className='grid gap-2'>
              {AVAILABLE_PERMISSIONS.map((p) => (
                <div
                  key={p?.id}
                  onClick={() => togglePermission(p?.id)}
                  className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-all ${
                    selectedPermissions.includes(p?.id)
                      ? 'bg-primary/5 border-primary/30 text-primary'
                      : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className='text-xs font-medium'>{p?.label}</span>
                  {selectedPermissions.includes(p?.id) && (
                    <CheckCircle2 className='w-3.5 h-3.5' />
                  )}
                </div>
              ))}
            </div>
            <Controller
              name='permissions'
              control={control}
              render={({ fieldState }) => (
                <FieldError errors={[fieldState.error]} />
              )}
            />
          </div>

          <div className='flex gap-2'>
            {editData && (
              <Button
                type='button'
                variant='outline'
                onClick={onCancel}
                className='flex-1 text-xs h-9'
              >
                Batal
              </Button>
            )}
            <Button type='submit' className='flex-1 text-xs h-9'>
              <Plus className='w-3.5 h-3.5 mr-1.5' />{' '}
              {editData ? 'Update Role' : 'Buat Role'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
