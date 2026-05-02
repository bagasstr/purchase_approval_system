import { prisma } from '@/lib/prisma';

interface Profile {
  name: string;
  phone: string;
  image: string;
}

export const UserRepository = {
  async getById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
        role: true,
      },
    });
  },

  async getByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: { department: true, role: true },
    });
  },

  async updateProfile(id: string, data: Profile) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  async updateRoleEmployee(email: string) {

    const roleRecord = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } });
    return await prisma.user.update({
      where: { email },
      data: {
        roleId: roleRecord?.id,
      },
    });
  },

  async updateRole(id: string, roleId: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        roleId,
      },
      include: {
        department: true,
        role: true,
      },
    });
  },

  async suspendUser(id: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  },

  async getAllUsers() {
    return await prisma.user.findMany({
      include: {
        department: true,
        role: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async getByDepartment(departmentId: string) {
    return await prisma.user.findMany({
      where: { departmentId },
    });
  },
};
