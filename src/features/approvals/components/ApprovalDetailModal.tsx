'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useApprovalAction } from '../hooks/useApprovalAction';

interface ApprovalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  approval: any;
  onSuccess: () => void;
}

export const ApprovalDetailModal = ({
  isOpen,
  onClose,
  approval,
  onSuccess,
}: ApprovalDetailModalProps) => {
  const {
    remarks,
    setRemarks,
    isSubmitting,
    itemPrices,
    handleAction,
    handlePriceChange,
    isSurveyStep,
    request,
  } = useApprovalAction(approval, onSuccess, onClose);

  if (!approval) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider'>
              {request.requestNo}
            </span>
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                approval.action === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700',
              )}
            >
              {approval.action === 'APPROVED'
                ? `DISETUJUI OLEH ${approval.role?.name}`
                : isSurveyStep
                  ? 'TAHAP SURVEY HARGA (PROCUREMENT)'
                  : `MENUNGGU PERSETUJUAN ${approval.role?.name}`}
            </span>
          </div>
          <DialogTitle className='text-2xl'>{request.title}</DialogTitle>
          <DialogDescription>
            {isSurveyStep
              ? 'Silakan masukkan hasil survey harga barang sebelum menyetujui.'
              : 'Tinjau rincian pengajuan di bawah ini sebelum mengambil keputusan.'}
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-3 gap-6 mt-6'>
          <div className='col-span-2 space-y-6'>
            {}
            <div className='grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-dashed'>
              <div className='space-y-1'>
                <p className='text-[10px] text-muted-foreground uppercase font-bold tracking-tight'>
                  Pemohon
                </p>
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs uppercase'>
                    {request.requester.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className='font-bold text-sm text-foreground'>
                      {request.requester.name}
                    </p>
                    <p className='text-[10px] text-muted-foreground'>
                      {request.requester.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className='space-y-1'>
                <p className='text-[10px] text-muted-foreground uppercase font-bold tracking-tight'>
                  Divisi / Sisa Limit
                </p>
                <p className='font-bold text-sm text-foreground uppercase'>
                  {request.department?.name || 'Umum'}
                </p>
                <p className='text-[10px] font-mono font-bold text-primary'>
                  Rp {Number(request.requester.approvalLimit || 0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                  Daftar Barang
                </h4>
              </div>
              <div className='rounded-xl border overflow-hidden bg-card'>
                <table className='w-full text-left text-sm'>
                  <thead className='bg-muted/50 border-b text-[10px] uppercase font-bold text-muted-foreground'>
                    <tr>
                      <th className='px-4 py-2'>Item</th>
                      {approval.stepOrder >= 2 && (
                        <>
                          <th className='px-4 py-2 text-right'>Harga Satuan</th>
                          <th className='px-4 py-2 text-right'>Total</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(request.items || []).map((item: any, i: number) => (
                      <tr key={i} className='border-b last:border-0 hover:bg-muted/30 transition-colors'>
                        <td className='px-4 py-4'>
                          <div className='flex items-center justify-between gap-4'>
                            <p className='font-bold text-base text-foreground'>
                              {item.itemName}
                            </p>
                            <p className='text-sm font-black bg-primary/10 text-primary px-3 py-1 rounded-lg border border-primary/20'>
                              {item.quantity} <span className='text-[10px] font-bold opacity-70'>PCS</span>
                            </p>
                          </div>
                        </td>
                        {approval.stepOrder >= 2 && (
                          <>
                            <td className='px-4 py-4 text-right'>
                              {isSurveyStep ? (
                                <div className='flex items-center gap-2 justify-end'>
                                  <span className='text-sm font-bold text-muted-foreground'>
                                    Rp
                                  </span>
                                  <Input
                                    type='text'
                                    className='w-40 h-10 text-sm font-bold text-right'
                                    placeholder='Input Harga'
                                    value={
                                      itemPrices[item.id] ??
                                      Number(item.unitPrice || 0)
                                    }
                                    onChange={(e) =>
                                      handlePriceChange(
                                        item.id,
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </div>
                              ) : (
                                <p className='font-bold text-sm'>
                                  Rp{' '}
                                  {Number(item.unitPrice).toLocaleString(
                                    'id-ID',
                                  )}
                                </p>
                              )}
                            </td>
                            <td className='px-4 py-4 text-right font-black text-base text-primary'>
                              Rp{' '}
                              {isSurveyStep
                                ? (
                                    item.quantity *
                                    (itemPrices[item.id] ??
                                      Number(item.unitPrice || 0))
                                  ).toLocaleString('id-ID')
                                : Number(item.subtotal).toLocaleString('id-ID')}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {approval.stepOrder >= 2 && (
                    <tfoot className='bg-muted/30 font-bold'>
                      <tr>
                        <td
                          className='px-4 py-3 uppercase text-[10px]'
                          colSpan={2}
                        >
                          Total Keseluruhan
                        </td>
                        <td className='px-4 py-3 text-right text-primary'>
                          Rp{' '}
                          {isSurveyStep
                            ? (request.items || [])
                                .reduce((sum: number, item: any) => {
                                  const price =
                                    itemPrices[item.id] ??
                                    Number(item.unitPrice || 0);
                                  return sum + price * (item.quantity || 0);
                                }, 0)
                                .toLocaleString('id-ID')
                            : Number(request.totalAmount).toLocaleString(
                                'id-ID',
                              )}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {}
            {request.description && (
              <div className='bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3'>
                <Info className='w-5 h-5 text-blue-500 shrink-0' />
                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight'>
                    Catatan Pemohon:
                  </p>
                  <p className='text-xs text-blue-900 dark:text-blue-200 leading-relaxed'>
                    {request.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className='col-span-1 space-y-6'>
            {approval.action === 'PENDING' && (
              <div className='p-5 rounded-2xl border-2 border-primary/10 bg-primary/5 space-y-4'>
                <div className='space-y-1'>
                  <h4 className='text-xs font-bold uppercase tracking-widest text-primary'>
                    Tindakan Persetujuan
                  </h4>
                  <p className='text-[10px] text-muted-foreground leading-relaxed'>
                    {isSurveyStep
                      ? 'Pastikan harga sudah benar sebelum menyetujui.'
                      : 'Berikan alasan atau catatan tambahan (opsional):'}
                  </p>
                </div>

                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    isSurveyStep
                      ? 'Contoh: Harga sudah sesuai survey pasar.'
                      : 'Contoh: Anggaran disetujui.'
                  }
                  className='w-full min-h-[120px] p-3 text-xs bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none'
                />

                <div className='space-y-2'>
                  <Button
                    className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]'
                    onClick={() => handleAction('APPROVED')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      <>
                        <CheckCircle className='w-4 h-4 mr-2' />{' '}
                        {isSurveyStep
                          ? 'Simpan Harga & Setujui'
                          : 'Setujui Permintaan'}
                      </>
                    )}
                  </Button>
                  <Button
                    variant='outline'
                    className='w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold h-11 rounded-xl transition-all active:scale-[0.98]'
                    onClick={() => handleAction('REJECTED')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      <>
                        <XCircle className='w-4 h-4 mr-2' /> Tolak Permintaan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className='p-4 border rounded-xl bg-muted/10 space-y-3'>
              <p className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground'>
                Tahap Saat Ini
              </p>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold'>
                  {approval.stepOrder}
                </div>
                <div>
                  <p className='text-sm font-bold'>
                    {approval.stepOrder === 1
                      ? 'MANAGER'
                      : approval.stepOrder === 2
                        ? 'PROCUREMENT (SURVEY HARGA)'
                        : approval.stepOrder === 3
                          ? 'FINANCE'
                          : approval.stepOrder === 4
                            ? 'PROCUREMENT (BELI BARANG)'
                            : approval.role?.name || 'Reviewer'}
                  </p>
                  <p className='text-[10px] text-muted-foreground uppercase'>
                    Tahap {approval.stepOrder} dari{' '}
                    {request.approvals?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
