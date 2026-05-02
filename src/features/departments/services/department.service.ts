import { DepartmentRepository } from '../repository/department.repository';

export const DepartmentService = {
  async getById(id: string) {
    const dept = await DepartmentRepository.getById(id);
    if (!dept) throw new Error('Department tidak ditemukan.');
    return dept;
  },

  async getByName(name: string) {
    const dept = await DepartmentRepository.getByName(name);
    if (!dept) throw new Error('Department dengan nama tersebut tidak ditemukan.');
    return dept;
  },

  async getAll() {
    // Tetap return list kosong agar halaman UI tetap bisa dirender.
    return await DepartmentRepository.getAll();
  },

  async createDepartment(name: string) {
    if (!name.trim()) throw new Error('Nama department jangan kosong!');
    return await DepartmentRepository.create(name);
  },
  async assignDepartment(deptName: string, id: string) {
    return await DepartmentRepository.assignUserToDepartment(deptName, id);
  },

  async updateDepartment(id: string, name: string) {
    if (!name.trim()) throw new Error('Nama department baru jangan kosong!');
    return await DepartmentRepository.update(id, name);
  },

  async deleteById(id: string) {
    return await DepartmentRepository.deleteById(id);
  },

  async deleteAll() {
    return await DepartmentRepository.deleteAll();
  },
};
