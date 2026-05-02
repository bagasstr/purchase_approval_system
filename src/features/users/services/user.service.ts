import { UserRepository } from '../repository/user.repository';

interface Profile {
  name: string;
  phone: string;
  image: string;
}

export const UserService = {
  async getById(id: string) {
    const user = await UserRepository.getById(id);
    if (!user) throw new Error('User tidak ditemukan.');
    return user;
  },

  async getByEmail(email: string) {
    const user = await UserRepository.getByEmail(email);
    if (!user) throw new Error('Email tidak terdaftar.');
    return user;
  },

  async updateProfile(id: string, data: Profile) {
    if (!data.name) throw new Error('Nama tidak boleh kosong.');
    return await UserRepository.updateProfile(id, data);
  },

  // async updateRole(id: string, role: string) {
  //   return await UserRepository.updateRole(id, role);
  // },

  async updateRoleEmployee(email: string) {
    return await UserRepository.updateRoleEmployee(email);
  },

  async getAllUsers() {
    return await UserRepository.getAllUsers();
  },

  async getByDepartment(departmentId: string) {
    return await UserRepository.getByDepartment(departmentId);
  },
};
