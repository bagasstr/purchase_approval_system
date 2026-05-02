import { prisma } from '@/lib/prisma'
import { DataRole } from '@/types/types'
export const rolesRepository = {
  async getById(id: string) {
    return await prisma.role.findUnique({
      where: { id },

      include: {
        _count: {
          select: { users: true },
        },
      },
    })
  },
  async getAllRoles() {
    return await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },
  async updateRole(id: string, data: DataRole) {
    return await prisma.role.update({
      where: { id },
      data: {
        name: data.name.toUpperCase(),
        permissions: data.permissions,
      },
    })
  },
  async createRole(data: DataRole) {
    return await prisma.role.create({
      data: {
        name: data.name.toUpperCase(),
        permissions: data.permissions,
      },
    })
  },
  async deleteRole(id: string) {
    return await prisma.role.delete({
      where: { id },
    })
  },
}
