import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestSchema, RequestFormValues } from '../schemas/request.schema';
import { createRequestAction } from '../actions/purchaseRequestAction';

export const useRequestForm = (setIsOpen: (open: boolean) => void) => {
  const queryClient = useQueryClient();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      description: '',
      items: [{ itemName: '', quantity: 1 }],
    },
  });

  const { control, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const mutation = useMutation({
    mutationFn: (payload: any) => createRequestAction(payload),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(
          'Permintaan berhasil dikirim! Silakan tunggu proses survei harga dari tim pengadaan.'
        );
        reset();
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: ['requests'] });
      } else {
        toast.error(res.error || 'Gagal membuat permintaan.');
      }
    },
    onError: () => {
      toast.error('Terjadi kesalahan saat menyimpan data.');
    },
  });

  const onSubmit = async (data: RequestFormValues) => {
    const payload = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        unitPrice: 0,
        subtotal: 0,
      })),
    };

    mutation.mutate(payload);
  };

  return {
    ...form,
    fields,
    append,
    remove,
    onSubmit,
    loading: mutation.isPending,
  };
};
