'use client';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import * as z from 'zod';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useSignUpFormStore } from '@/stores/zustand';
import { addUserAction } from '@/features/users/actions/addUserAction';
import { getAllRoleAction } from '@/features/roles/actions/rolesAction';
import { getAllDepartmentAction } from '@/features/departments/actions/departmentAction';
import { toast } from 'sonner';
import { AddUserSchema } from '@/types/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Input = z.input<typeof AddUserSchema>;
type Output = z.output<typeof AddUserSchema>;

const AddUserForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<Boolean>(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const setSignUpForm = useSignUpFormStore((state) => state.setSignUpForm);
  const signUpForm = useSignUpFormStore((state) => state.signUpForm);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [rolesRes, deptRes] = await Promise.all([
          getAllRoleAction(),
          getAllDepartmentAction(),
        ]);
        setRoles(rolesRes || []);
        setDepartments(deptRes || []);
      } catch (error) {
        console.error(error);
      }
    };
    if (isOpen) fetchOptions();
  }, [isOpen]);

  const { control, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(AddUserSchema),
    defaultValues: {
      name: signUpForm.name ?? '',
      email: signUpForm.email ?? '',
      phone: signUpForm.phone ?? '',
      password: signUpForm.password ?? '',
      role: '',
      department: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit: SubmitHandler<Output> = async (data) => {
    setSignUpForm(data);
    const res = await addUserAction(data);

    if (res.success) {
      toast.success('User baru berhasil ditambahkan!');
      setIsOpen(false);
      reset();

      window.location.reload();
    } else {
      toast.error(res.error || 'Gagal menambahkan user');
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className='flex items-center gap-2'>
          <Plus className='w-4 h-4' /> New User
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Tambah user</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk membuat akun
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name={'name'}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='name'>Name</FieldLabel>
                  <Input
                    id='name'
                    type='text'
                    required
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name={'phone'}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='phone'>Phone</FieldLabel>
                  <Input
                    id='phone'
                    type='text'
                    required
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name={'email'}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='email'>Email</FieldLabel>
                  <Input
                    id='email'
                    type='email'
                    placeholder='m@example.com'
                    required
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name={'password'}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <div className='flex items-center'>
                    <FieldLabel htmlFor='password'>Password</FieldLabel>
                  </div>
                  <div className='relative'>
                    <Input
                      id='password'
                      required
                      type={showPassword ? 'text' : 'password'}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
                    >
                      {showPassword ? (
                        <EyeOff className='size-4' />
                      ) : (
                        <Eye className='size-4' />
                      )}
                    </button>
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              name={'role'}
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='role'>Role / Jabatan</FieldLabel>
                  <select
                    id='role'
                    className='w-full px-3 py-2 text-sm bg-transparent border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
                    {...field}
                  >
                    <option value='' className='bg-background'>
                      Pilih Role
                    </option>
                    {roles.map((r) => (
                      <option
                        key={r.id}
                        value={r.name}
                        className='bg-background'
                      >
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            {selectedRole !== 'ADMIN' && (
              <Controller
                name={'department'}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor='department'>Divisi</FieldLabel>
                    <select
                      id='department'
                      className='w-full px-3 py-2 text-sm bg-transparent border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
                      {...field}
                    >
                      <option value='' className='bg-background'>
                        Pilih Divisi (Opsional)
                      </option>
                      {departments.map((d) => (
                        <option
                          key={d.id}
                          value={d.name}
                          className='bg-background'
                        >
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}
            <Field className='pt-2'>
              <Button type='submit' className='w-full'>
                Buat Akun
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserForm;
