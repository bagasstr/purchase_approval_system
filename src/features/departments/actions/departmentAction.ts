'use server';

import { hasPermission } from '@/lib/rbac';
import { DepartmentService } from '../services/department.service';

export const getDepartmentByIdAction = async (id: string) => {
  try {
    const dept = await DepartmentService.getById(id);
    return {
      ...dept,
      createdAt: dept.createdAt ? dept.createdAt.toISOString() : null,
      updatedAt: dept.updatedAt ? dept.updatedAt.toISOString() : null,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil data department.');
  }
};

export const getAllDepartmentAction = async () => {
  try {
    const depts = await DepartmentService.getAll();
    return depts.map((dept: any) => ({
      ...dept,
      createdAt: dept.createdAt ? dept.createdAt.toISOString() : null,
      updatedAt: dept.updatedAt ? dept.updatedAt.toISOString() : null,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil data department.');
  }
};
export const createDepartmentAction = async (name: string) => {
  try {
    const res = await DepartmentService.createDepartment(name);
    return res;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal membuat department.');
  }
};
export const assignDepartmentAction = async (deptName: string, id: string) => {
  try {
    if (!(await hasPermission('user:all'))) {
      throw new Error('Kamu tidak memiliki izin kelola department');
    }
    await DepartmentService.assignDepartment(deptName, id);
  } catch (error: any) {
    throw new Error(error.message || 'Gagal membuat department.');
  }
};
export const updateDepartmentAction = async (id: string, name: string) => {
  try {
    await DepartmentService.updateDepartment(id, name);
  } catch (error: any) {
    throw new Error(error.message || 'Gagal update department.');
  }
};
export const deleteDepartmentAction = async (id: string) => {
  try {
    const result = await DepartmentService.deleteById(id);
    return {
      ...result,
      createdAt: result.createdAt ? result.createdAt.toISOString() : null,
      updatedAt: result.updatedAt ? result.updatedAt.toISOString() : null,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Gagal menghapus department.');
  }
};
