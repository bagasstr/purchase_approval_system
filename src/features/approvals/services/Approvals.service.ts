import {
  ApprovalsRepository,
  ApprovalUpdateData,
} from '../repository/Approvals.repository';

export const ApprovalsServices = {
  async getAllApprovals() {
    const res = await ApprovalsRepository.getAllApprovals();
    return res;
  },
  async getApprovalById(id: string) {
    const existing = await ApprovalsRepository.getAprovalById(id);
    if (!existing) throw new Error('Data approval tidak ditemukan!');
    return existing;
  },

  async updateApproval(id: string, data: ApprovalUpdateData) {

    const existing = await ApprovalsServices.getApprovalById(id);

    if (existing.action !== 'PENDING') {
      throw new Error('Approval ini udah diproses');
    }


    if (data.action === 'APPROVED') {
      const requester = existing.purchaseRequest.requester;
      const requesterLimit = Number(requester.approvalLimit || 0);
      const prAmount = Number(existing.purchaseRequest.totalAmount);


      if (requesterLimit > 0 && prAmount > requesterLimit) {
        throw new Error(
          `Pengajuan ini (Rp ${prAmount.toLocaleString()}) melebihi batas limit pemohon ${requester.name} (Rp ${requesterLimit.toLocaleString()})!`,
        );
      }
    }

    return await ApprovalsRepository.updateApproval(id, data);
  },
};
