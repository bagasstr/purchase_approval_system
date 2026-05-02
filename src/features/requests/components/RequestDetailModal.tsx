'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShoppingBag,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: any;
}

export const RequestDetailModal = ({
  isOpen,
  onClose,
  request,
}: RequestDetailModalProps) => {
  if (!request) return null;

  const isPriceAvailable = request.approvals?.some(
    (a: any) => a.stepOrder === 2 && a.action === 'APPROVED',
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider'>
              {request.requestNo}
            </span>
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                request.status === 'PENDING'
                  ? 'bg-amber-100 text-amber-700'
                  : request.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700',
              )}
            >
              {request.status}
            </span>
          </div>
          <DialogTitle className='text-xl'>{request.title}</DialogTitle>
          <DialogDescription className='text-sm mt-2'>
            {request.description || 'Kaga ada deskripsi tambahan.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='details' className='mt-6'>
          <TabsList className='grid w-full grid-cols-2 bg-muted/50'>
            <TabsTrigger value='details'>Rincian Permintaan</TabsTrigger>
            <TabsTrigger value='history'>Riwayat Persetujuan</TabsTrigger>
          </TabsList>

          <TabsContent value='details' className='space-y-6 mt-6'>
            <div className='grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-dashed'>
              <div className='space-y-1'>
                <p className='text-[10px] text-muted-foreground uppercase font-bold tracking-tight'>
                  Pemohon
                </p>
                <p className='font-bold text-foreground'>
                  {request.requester.name}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {request.requester.email}
                </p>
              </div>
              <div className='space-y-1'>
                <p className='text-[10px] text-muted-foreground uppercase font-bold tracking-tight'>
                  Divisi
                </p>
                <p className='font-bold text-foreground uppercase'>
                  {request.department?.name || 'Umum'}
                </p>
                <div className='mt-2 p-2 bg-primary/5 rounded-lg border border-primary/10'>
                  <p className='text-[9px] text-muted-foreground uppercase font-black'>Sisa Limit Anda</p>
                  <p className='text-sm font-mono font-bold text-primary'>
                    Rp {Number(request.requester.approvalLimit || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-bold flex items-center gap-2'>
                  <ShoppingBag className='w-4 h-4 text-primary' /> Daftar Barang
                </h4>
                <span className='text-[10px] font-bold text-muted-foreground uppercase'>
                  {request.items.length} Item
                </span>
              </div>
              <div className='rounded-xl border overflow-hidden bg-card'>
                <table className='w-full text-left text-sm'>
                  <thead className='bg-muted/50 border-b text-[10px] uppercase font-bold text-muted-foreground'>
                    <tr>
                      <th className='px-4 py-2'>Barang</th>
                      <th className='px-4 py-2 text-center'>Jumlah</th>
                      {isPriceAvailable && (
                        <>
                          <th className='px-4 py-2 text-right'>Harga Satuan</th>
                          <th className='px-4 py-2 text-right'>Subtotal</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {request.items.map((item: any, i: number) => (
                      <tr key={i} className='hover:bg-muted/30'>
                        <td className='px-4 py-3 font-medium'>
                          {item.itemName}
                        </td>
                        <td className='px-4 py-3 text-center'>
                          {item.quantity}
                        </td>
                        {isPriceAvailable && (
                          <>
                            <td className='px-4 py-3 text-right text-muted-foreground'>
                              Rp {Number(item.unitPrice).toLocaleString('id-ID')}
                            </td>
                            <td className='px-4 py-3 text-right font-bold text-foreground'>
                              Rp {Number(item.subtotal).toLocaleString('id-ID')}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {isPriceAvailable && (
                    <tfoot className='bg-muted/30 font-bold'>
                      <tr>
                        <td colSpan={3} className='px-4 py-3 text-right'>
                          Total Keseluruhan
                        </td>
                        <td className='px-4 py-3 text-right text-primary text-lg underline decoration-primary/30 decoration-2 underline-offset-4'>
                          Rp {Number(request.totalAmount).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {request.description && (
              <div className='bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3'>
                <Info className='w-5 h-5 text-blue-500 shrink-0 mt-0.5' />
                <div className='space-y-1'>
                  <p className='text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight'>
                    Catatan Pemohon:
                  </p>
                  <p className='text-sm text-blue-900 dark:text-blue-200'>
                    {request.description}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value='history' className='mt-6'>
            <div className='space-y-6'>
              {request.approvals && request.approvals.length > 0 ? (
                request.approvals
                  .sort((a: any, b: any) => a.stepOrder - b.stepOrder)
                  .map((step: any, i: number) => (
                    <div key={i} className='flex gap-4 relative group'>
                      {i < request.approvals.length - 1 && (
                        <div className='absolute left-5 top-10 bottom-[-24px] w-0.5 bg-zinc-200 dark:bg-zinc-800 group-hover:bg-primary/20 transition-colors' />
                      )}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-background shadow-sm',
                          step.action === 'APPROVED'
                            ? 'bg-emerald-500 text-white'
                            : step.action === 'REJECTED'
                              ? 'bg-red-500 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400',
                        )}
                      >
                        {step.action === 'APPROVED' ? (
                          <CheckCircle className='w-5 h-5' />
                        ) : step.action === 'REJECTED' ? (
                          <XCircle className='w-5 h-5' />
                        ) : (
                          <span className='text-xs font-bold'>
                            {step.stepOrder}
                          </span>
                        )}
                      </div>
                      <div className='flex-1 space-y-2 pb-6'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-bold text-foreground'>
                            {step.stepOrder === 1
                              ? 'MANAGER'
                              : step.stepOrder === 2
                                ? 'PROCUREMENT (SURVEY HARGA)'
                                : step.stepOrder === 3
                                  ? 'FINANCE'
                                  : step.stepOrder === 4
                                    ? 'PROCUREMENT (BELI BARANG)'
                                    : step.role.name}
                          </p>
                          {step.actedAt && (
                            <span className='text-[10px] text-muted-foreground flex items-center gap-1'>
                              <Clock className='w-3 h-3' />{' '}
                              {new Date(step.actedAt).toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                        <div className='bg-muted/30 p-3 rounded-lg border border-dashed group-hover:border-primary/20 transition-colors'>
                          <div className='flex items-center justify-between mb-2'>
                            <span
                              className={cn(
                                'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase',
                                step.action === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : step.action === 'REJECTED'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-zinc-100 text-zinc-500',
                              )}
                            >
                              {step.action}
                            </span>
                            {step.actor && (
                              <span className='text-[10px] font-medium italic text-muted-foreground'>
                                Oleh {step.actor.name}
                              </span>
                            )}
                          </div>
                          <p className='text-xs text-muted-foreground italic leading-relaxed'>
                            &quot;
                            {step.remarks || 'Tidak ada catatan.'}
                            &quot;
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className='text-center py-12 text-zinc-400'>
                  <AlertCircle className='w-8 h-8 mx-auto mb-2 opacity-20' />
                  <p className='text-sm'>Belum ada riwayat persetujuan.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
