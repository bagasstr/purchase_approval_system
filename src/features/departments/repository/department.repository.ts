import { prisma } from '@/lib/prisma';

export const DepartmentRepository = {
  async getById(id: string) {
    return await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  },

  async getByName(name: string) {
    return await prisma.department.findUnique({
      where: { name },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  },

  async getAll() {
    return await prisma.department.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  },

  async update(id: string, name: string) {
    return await prisma.department.update({
      where: { id },
      data: { name },
    });
  },
  async create(name: string) {
    return await prisma.department.create({
      data: { name },
    });
  },

  async assignUserToDepartment(departmentName: string, userId: string) {
    return await prisma.department.upsert({
      where: { name: departmentName },
      create: {
        name: departmentName,
        users: {
          connect: { id: userId },
        },
      },
      update: {
        users: {
          connect: { id: userId },
        },
      },
    });
  },

  async deleteById(id: string) {
    return await prisma.department.delete({
      where: { id },
    });
  },

  async deleteAll() {
    return await prisma.department.deleteMany({});
  },
};
