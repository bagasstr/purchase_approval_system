import { z } from 'zod';

export const itemSchema = z.object({
  itemName: z.string().min(1, 'Nama barang wajib diisi'),
  quantity: z.number().min(1, 'Minimal jumlah adalah 1'),
});

export const requestSchema = z.object({
  title: z.string().min(3, 'Judul terlalu pendek'),
  description: z.string().optional(),
  items: z.array(itemSchema).min(1, 'Harap pilih minimal satu barang'),
});

export type RequestFormValues = z.infer<typeof requestSchema>;
