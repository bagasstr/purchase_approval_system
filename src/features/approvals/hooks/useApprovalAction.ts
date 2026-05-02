import { useState } from 'react';
import { toast } from 'sonner';
import { updateApprovalAction } from '../actions/ApprovalsAction';
import { updateRequestItemsAction } from '@/features/requests/actions/purchaseRequestAction';

export const useApprovalAction = (
  approval: any,
  onSuccess: () => void,
  onClose: () => void
) => {
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});

  const request = approval?.purchaseRequest;
  const isSurveyStep = approval?.stepOrder === 2 && approval?.action === 'PENDING';

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    try {
      setIsSubmitting(true);


      if (isSurveyStep && action === 'APPROVED') {
        const itemsToUpdate = request.items.map((item: any) => ({
          id: item.id,
          unitPrice: itemPrices[item.id] || Number(item.unitPrice || 0),
        }));

        const hasZeroPrice = itemsToUpdate.some((i: any) => i.unitPrice <= 0);
        if (hasZeroPrice) {
          throw new Error('Semua harga barang harus diisi terlebih dahulu.');
        }

        const resUpdate = await updateRequestItemsAction(
          request.id,
          itemsToUpdate
        );
        if (!resUpdate.success) throw new Error(resUpdate.error);
      }

      await updateApprovalAction(approval.id, {
        action,
        remarks: remarks || (action === 'APPROVED' ? 'Disetujui' : 'Ditolak'),
      });

      toast.success(
        `Permintaan berhasil di-${action === 'APPROVED' ? 'setujui' : 'tolak'}!`
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (itemId: string, price: number) => {
    setItemPrices((prev) => ({ ...prev, [itemId]: price }));
  };

  return {
    remarks,
    setRemarks,
    isSubmitting,
    itemPrices,
    handleAction,
    handlePriceChange,
    isSurveyStep,
    request,
  };
};
