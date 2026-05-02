import { ApprovalAction } from '../../generated/prisma/enums';

export interface SignUpData {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
}
export interface SignInData {
  email?: string;
  password?: string;
}

export interface UserData {
  id?: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  phone?: string | null | undefined;
  roleId?: string | null | undefined;
  role?: string | null | undefined;
  createdAt?: Date;
  departmentId?: string;
  approvalLimit?: number;
  updatedAt?: Date;
}

export type AuthData = SignUpData & SignInData;

export interface DataRole {
  name: string;
  permissions: string[];
}
