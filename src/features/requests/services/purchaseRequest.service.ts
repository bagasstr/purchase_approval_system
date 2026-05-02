import { PurchaseRequestRepository } from '../repository/purchaseRequest.repository';
import { rolesRepository } from '@/features/roles/repository/roles.repository';

export const PurchaseRequestService = {
  async getAllRequests() {
    return await PurchaseRequestRepository.getAll();
  },

  async getRequestById(id: string) {
    const request = await PurchaseRequestRepository.getById(id);
    if (!request) throw new Error('Request tidak ditemukan.');
    return request;
  },

  async getUserRequests(userId: string) {
    return await PurchaseRequestRepository.getByUser(userId);
  },

  async getDepartmentRequests(departmentId: string) {
    return await PurchaseRequestRepository.getByDepartment(departmentId);
  },

  async createRequest(userId: string, departmentId: string, data: any) {
    // Generate Request Number (PR-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const allReqs = await PurchaseRequestRepository.getAll();
    const nextNum = (allReqs.length + 1).toString().padStart(4, '0');
    const requestNo = `PR-${dateStr}-${nextNum}`;

    // Alur Pengadaan Baru: Manager -> Procurement (Survey) -> Finance -> Procurement (Beli)
    const requiredPermissions = [
      'purchase-request:approve-manager',
      'purchase-request:approve-procurement-survey',
      'purchase-request:approve-finance',
      'purchase-request:approve-procurement-purchase',
    ];

    const allRoles = await rolesRepository.getAllRoles();
    const approvals = requiredPermissions.map((prem, index) => {
      const targetRole = allRoles.find((role: any) =>
        role?.permissions?.includes(prem),
      );

      if (!targetRole) {
        throw new Error(
          `Tidak ada role dengan permission '${prem}'. Silakan konfigurasi role terlebih dahulu.`,
        );
      }

      return {
        stepOrder: index + 1,
        roleId: targetRole.id,
        action: 'PENDING',
      };
    });

    return await PurchaseRequestRepository.createRequest({
      requestNo,
      title: data.title,
      description: data.description,
      totalAmount: data.totalAmount,
      userId,
      departmentId,
      items: data.items,
      approvals,
    });
  },
};
