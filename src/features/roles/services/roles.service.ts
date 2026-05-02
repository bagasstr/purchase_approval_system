import { DataRole } from '@/types/types';
import { rolesRepository } from '@/features/roles/repository/roles.repository';

// Roles service has been migrated to Better-Auth RBAC
export const rolesService = {
  // Relational roles logic is deprecated
  async getById(id: string) {
    const role = await rolesRepository.getById(id);
    if (!role) throw new Error(`Role ${id} tidak ditemukan`);
    return role;
  },

  async getAllRoles() {
    const role = await rolesRepository.getAllRoles();
    if (!role) throw new Error('Role tidak ditemukan');
    return role;
  },

  async updateRole(id: string, data: DataRole) {
    if (!data.name || !data.permissions)
      throw new Error('Nama dan Permission tidak boleh kosong!.');
    return await rolesRepository.updateRole(id, data);
  },

  async createRole(data: DataRole) {
    if (!data.name || !data.permissions)
      throw new Error('Nama dan Permission tidak boleh kosong!.');
    return await rolesRepository.createRole(data);
  },

  async deleteRole(id: string) {
    return await rolesRepository.deleteRole(id);
  },
};
