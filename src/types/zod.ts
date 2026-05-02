import z from 'zod';

export const RegisterSchema = z
  .object({
    name: z
      .string({ error: 'Nama harus diisi' })
      .min(5, 'Nama harus lebih dari 5 karakter'),
    email: z.email({ error: 'Email harus diisi' }),
    phone: z
      .string({ error: 'Email harus diisi' })
      .min(10, 'Nomor HP harus lebih dari 10 karakter')
      .regex(/^[0-9]+$/, 'Nomor HP harus berupa angka'),

    password: z.string().min(5, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(5, 'Password minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

export const AddUserSchema = z.object({
  name: z
    .string({ error: 'Nama harus diisi' })
    .min(5, 'Nama harus lebih dari 5 karakter'),
  email: z.email({ error: 'Email harus diisi' }),
  phone: z
    .string({ error: 'Email harus diisi' })
    .min(10, 'Nomor HP harus lebih dari 10 karakter')
    .regex(/^[0-9]+$/, 'Nomor HP harus berupa angka'),

  password: z.string().min(5, 'Password minimal 8 karakter'),
  role: z.string().optional(),
  department: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.email({ error: 'Email harus diisi' }),
  password: z.string().min(5, 'Password minimal 8 karakter'),
});

export const PurchaseItemSchema = z.object({
  itemName: z.string().min(1, 'Nama item harus diisi'),
  quantity: z.number().min(1, 'Jumlah minimal 1'),
  unitPrice: z.number().min(0, 'Harga harus lebih dari 0'),
});

export const PurchaseRequestSchema = z.object({
  title: z.string().min(5, 'Judul harus lebih dari 5 karakter'),
  description: z.string().optional(),
  items: z.array(PurchaseItemSchema).min(1, 'Minimal 1 item harus ditambahkan'),
});
