'use client';

import { Controller } from 'react-hook-form';
import { Plus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { useDepartmentForm } from '../hooks/useDepartmentForm';

interface AddDeptFormProps {
  onSuccess: (newDept: any) => void;
  editData?: any;
  onCancel?: () => void;
}

export const AddDeptForm = ({
  onSuccess,
  editData,
  onCancel,
}: AddDeptFormProps) => {
  const { control, handleSubmit, onSubmit } = useDepartmentForm(
    onSuccess,
    editData,
    onCancel
  );

  return (
    <Card className='md:col-span-1 backdrop-blur-sm bg-card/80 border-zinc-200/50 dark:border-zinc-800/50 h-fit'>
      <CardHeader>
        <CardTitle className='text-base font-semibold flex items-center gap-2'>
          <Plus className='w-4 h-4 text-primary' />{' '}
          {editData ? 'Edit Divisi' : 'Buat Baru'}
        </CardTitle>
        <CardDescription className='text-xs'>
          {editData
            ? 'Ubah nama divisi ini.'
            : 'Tambahkan divisi baru ke dalam sistem workflow.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <FieldGroup>
            <Controller
              name={'dept'}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Divisi</FieldLabel>
                  <Input type='text' placeholder='Contoh: HRD' {...field} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
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
              {editData ? 'Update Divisi' : 'Buat Divisi'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
