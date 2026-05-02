import { useEffect } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, DepartmentInput } from '../schemas/department.schema';
import { createDepartmentAction, updateDepartmentAction } from '../actions/departmentAction';

export const useDepartmentForm = (
  onSuccess: (newDept: any) => void,
  editData?: any,
  onCancel?: () => void
) => {
  const form = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      dept: '',
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (editData) {
      reset({
        dept: editData.name,
      });
    } else {
      reset({
        dept: '',
      });
    }
  }, [editData, reset]);

  const onSubmit = async (data: DepartmentInput) => {
    try {
      let result;
      const upperName = data.dept.toUpperCase();

      if (editData) {
        await updateDepartmentAction(editData.id, upperName);
        result = { ...editData, name: upperName };
        toast.success(`Divisi ${upperName} berhasil di-update!`);
      } else {
        const newDept = await createDepartmentAction(upperName);
        result = { ...newDept, _count: { users: 0 } };
        toast.success(`Divisi ${upperName} berhasil dibuat!`);
      }

      onSuccess(result);
      reset();
      if (onCancel) onCancel();
    } catch (error: any) {
      toast.error(error.message || `Gagal memproses divisi!`);
    }
  };

  return { ...form, onSubmit };
};
