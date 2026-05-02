'use client';

import { cn } from '@/lib/utils';
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import * as z from 'zod';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useSignUpFormStore } from '@/stores/zustand';
import { signUpAction } from '@/features/auth/actions/signUp';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { RegisterSchema } from '@/types/zod';

type Input = z.input<typeof RegisterSchema>;
type Output = z.output<typeof RegisterSchema>;
export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [showPassword, setShowPassword] = useState<Boolean>(false);
  const setSignUpForm = useSignUpFormStore((state) => state.setSignUpForm);
  const signUpForm = useSignUpFormStore((state) => state.signUpForm);
  const router = useRouter();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: signUpForm.name ?? '',
      email: signUpForm.email ?? '',
      phone: signUpForm.phone ?? '',
      password: signUpForm.password ?? '',
      confirmPassword: signUpForm.confirmPassword ?? '',
    },
  });

  const onSubmit: SubmitHandler<Output> = async (data) => {
    try {
      setSignUpForm(data);
      const res = await signUpAction(data);

      if (res.success) {
        toast.success('Daftar berhasil!');
        router.replace('/dashboard');
      } else {
        toast.error(res.error || 'Gagal mendaftar!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan sistem');
    }
  };
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      <a
                        href='#'
                        className='ml-auto inline-block text-xs underline-offset-4 text-foreground/80 hover:underline'
                      >
                        Forgot your password?
                      </a>
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
                name={'confirmPassword'}
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <div className='flex items-center'>
                      <FieldLabel htmlFor='confirmPassword'>
                        Confirm Password
                      </FieldLabel>
                    </div>
                    <Input
                      id='confirmPassword'
                      required
                      type={showPassword ? 'text' : 'password'}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Field>
                <Button type='submit' className='w-full'>
                  Create Account
                </Button>
                <Button variant='outline' type='button'>
                  Login with Google
                </Button>
                <FieldDescription className='text-center'>
                  Already have an account? <a href='/signin'>Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
