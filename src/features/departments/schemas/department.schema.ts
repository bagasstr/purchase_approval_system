import { z } from 'zod';

export const departmentSchema = z.object({
  dept: z.string().min(2, 'Divisi harus diisi'),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
