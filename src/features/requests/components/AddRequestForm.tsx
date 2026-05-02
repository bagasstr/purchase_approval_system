'use client';

import { Controller } from 'react-hook-form';
import { Plus, Trash2, PackagePlus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRequestForm } from '../hooks/useRequestForm';

interface AddRequestFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const AddRequestForm = ({ isOpen, setIsOpen }: AddRequestFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    fields,
    append,
    remove,
    onSubmit,
    loading,
  } = useRequestForm(setIsOpen);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className='flex items-center gap-2'>
          <Plus className='w-4 h-4' /> Permintaan Baru
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className='text-lg font-semibold flex items-center gap-2'>
              <PackagePlus className='w-5 h-5 text-primary' /> Buat Permintaan Baru
            </DialogTitle>
            <DialogDescription>
              Tuliskan barang apa saja yang Anda butuhkan. Harga akan ditentukan oleh tim pengadaan.
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-6 py-6'>
            <div className='grid gap-2'>
              <Label htmlFor='title'>Judul Permintaan</Label>
              <Controller
                name='title'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder='Contoh: Pengadaan Laptop Divisi IT'
                  />
                )}
              />
              {errors.title && (
                <p className='text-xs text-red-500'>{errors.title.message}</p>
              )}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description'>Deskripsi Permintaan</Label>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder='Jelaskan alasan atau spesifikasi detail barang di sini.'
                  />
                )}
              />
            </div>

            <div className='grid gap-2'>
              <Label>Daftar Barang</Label>
              <div className='space-y-4'>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className='flex gap-3 items-start bg-muted/30 p-3 rounded-lg border'
                  >
                    <div className='grid flex-1 gap-2'>
                      <Controller
                        name={`items.${index}.itemName`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder='Nama Barang'
                            className='h-8 text-xs'
                          />
                        )}
                      />
                    </div>
                    <div className='w-24'>
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type='number'
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            placeholder='Qty'
                            className='h-8 text-xs'
                          />
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => remove(index)}
                        className='h-8 w-8 text-red-500'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    append({ itemName: '', quantity: 1 })
                  }
                  className='w-full border-dashed'
                >
                  <Plus className='w-3 h-3 mr-2' /> Tambah Barang Lain
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className='sm:justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Permintaan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRequestForm;
