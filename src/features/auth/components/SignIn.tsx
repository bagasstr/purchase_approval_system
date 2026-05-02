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
import { Input } from '@/components/ui/input';
import * as z from 'zod';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInAction } from '@/features/auth/actions/signIn';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { LoginSchema } from '@/types/zod';

type Input = z.input<typeof LoginSchema>;
type Output = z.output<typeof LoginSchema>;

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<Output> = async (data) => {
    const res = await signInAction(data);
    if (res.success) {
      toast.success('Login berhasil!');
      router.replace('/dashboard');
    } else {
      toast.error(res.error || 'Login gagal!');
    }
  };
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
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
                        className='ml-auto inline-block text-sm underline-offset-4 hover:underline'
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
              <Field>
                <Button type='submit' className='w-full'>
                  Login
                </Button>
                <Button variant='outline' type='button'>
                  Login with Google
                </Button>
                <FieldDescription className='text-center'>
                  Don&apos;t have an account? <a href='/signup'>Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
