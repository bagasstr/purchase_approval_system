import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },

  user: {
    additionalFields: {
      phone: { type: 'string', required: true },
      departmentId: { type: 'string', required: false },
      isActive: { type: 'boolean', required: false },
      roleId: { type: 'string', required: false },
      role: { type: 'string', required: false },
      approvalLimit: { type: 'number', required: false },
    },
  },

  plugins: [nextCookies()],
});
