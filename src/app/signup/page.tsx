'use client';

import { SignInForm } from '@/features/auth/components/SignIn';
import { SignUpForm } from '@/features/auth/components/SignUp';
import { cn } from '@/lib/utils';
import { ArrowLeft, Command } from 'lucide-react';
import Link from 'next/link';

const SignUpPage = () => {
  return (
    <div className='relative min-h-screen grid lg:grid-cols-2'>
      {}
      <div className='relative hidden lg:flex flex-col bg-zinc-950 p-10 text-white dark:border-r overflow-hidden'>
        {}
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent' />
        <div className='absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-zinc-950' />

        <div className='relative z-20 flex items-center gap-2 text-lg font-medium'>
          <span className='font-bold tracking-tight'>Approva</span>
        </div>

        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-4'>
            <p className='text-xl font-medium leading-relaxed'>
              &ldquo;Platform manajemen persetujuan otomatis yang membantu tim
              Anda tetap terorganisir dan fokus pada hal yang benar-benar
              penting.&rdquo;
            </p>
            <footer className='text-sm text-zinc-400'>
              Sederhanakan alur kerja dan percepat keputusan tim Anda.
            </footer>
          </blockquote>
        </div>
      </div>

      {}
      <div className='flex flex-col justify-center items-center p-6 lg:p-10'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]'>
          <div className='flex flex-col space-y-2 text-center lg:hidden'>
            <div className='flex items-center justify-center gap-2 mb-4'>
              <span className='text-2xl font-bold tracking-tight'>Approva</span>
            </div>
          </div>
          <SignUpForm />
          <div className=''>
            <Link
              href='/signin'
              className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
            >
              <ArrowLeft className='size-4' />
              Back to Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
