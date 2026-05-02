export interface ServerUser {
  id: string;
  name: string;
  email: string;
  departmentId: string | null;
  departmentName: string | null;
  roleId: string | null;
  roleName: string | null;
  permissions: string[];
  isAdmin: boolean;
  approvalLimit: number | null;
}
