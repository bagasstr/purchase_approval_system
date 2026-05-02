'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getMyApprovalsAction,
  updateApprovalAction,
} from '@/features/approvals/actions/ApprovalsAction';
import { authClient } from '@/lib/auth-client';
import { ApprovalDetailModal } from '@/features/approvals/components/ApprovalDetailModal';

const ApprovalsPage = () => {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: session } = authClient.useSession();

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await getMyApprovalsAction();
      setApprovals(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const filteredApprovals = approvals.filter((app) => {
    if (activeTab === 'All') return true;
    return app.action === activeTab;
  });

  const handleOpenDetail = (app: any) => {
    setSelectedApproval(app);
    setIsDetailOpen(true);
  };

  return (
    <>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Pusat Persetujuan
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Tinjau dan proses pengajuan pembelian dari tim Anda.
          </p>
        </div>
      </div>

      <Card className='backdrop-blur-sm bg-card/80 border-zinc-200/50 dark:border-zinc-800/50'>
        <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6'>
          <div className='flex items-center gap-1 bg-muted/60 p-1 rounded-lg border'>
            {['PENDING', 'APPROVED', 'REJECTED', 'All'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                  activeTab === tab
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab === 'All' ? 'Semua' : tab}
              </button>
            ))}
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Cari persetujuan...'
              className='w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
              <Loader2 className='w-8 h-8 animate-spin mb-2' />
              <p>Mohon tunggu, sedang mengambil data...</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-left border-collapse text-sm'>
                <thead>
                  <tr className='border-b text-muted-foreground text-xs font-medium'>
                    <th className='pb-3 px-3'>PR Number / Title</th>
                    <th className='pb-3 px-3'>Pengaju</th>
                    <th className='pb-3 px-3'>Total</th>
                    <th className='pb-3 px-3'>Tahapan</th>
                    <th className='pb-3 px-3'>Status</th>
                    <th className='pb-3 px-3 text-right'>Aksi</th>
                  </tr>
                </thead>
                <tbody className='divide-y border-zinc-100 dark:border-zinc-800/60'>
                  {filteredApprovals.map((app) => (
                    <tr
                      key={app.id}
                      className='hover:bg-muted/30 transition-colors cursor-pointer'
                      onClick={() => handleOpenDetail(app)}
                    >
                      <td className='py-4 px-3'>
                        <span className='text-[10px] text-primary font-bold px-1.5 py-0.5 bg-primary/10 rounded'>
                          {app.purchaseRequest.requestNo}
                        </span>
                        <p className='font-semibold text-sm text-foreground mt-1.5'>
                          {app.purchaseRequest.title}
                        </p>
                      </td>
                      <td className='py-4 px-3'>
                        <p className='font-medium text-foreground'>
                          {app.purchaseRequest.requester.name}
                        </p>
                        <span className='text-xs text-muted-foreground'>
                          {app.purchaseRequest.department?.name || 'No Dept'}
                        </span>
                      </td>
                      <td className='py-4 px-3 font-semibold text-foreground'>
                        Rp{' '}
                        {Number(
                          app.purchaseRequest.totalAmount,
                        ).toLocaleString('id-ID')}
                      </td>
                      <td className='py-4 px-3'>
                        <span className='text-[10px] font-bold px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded border border-zinc-200 dark:border-zinc-700 uppercase'>
                          {app.stepOrder === 1
                            ? 'Manager'
                            : app.stepOrder === 2
                              ? 'Procurement (Survey)'
                              : app.stepOrder === 3
                                ? 'Finance'
                                : app.stepOrder === 4
                                  ? 'Procurement (Beli)'
                                  : app.role?.name || 'Reviewer'}
                        </span>
                      </td>
                      <td className='py-4 px-3'>
                        {(() => {
                          if (app.action === 'PENDING') {
                            const currentActiveStep = app.purchaseRequest.approvals?.find(
                              (s: any) => s.action === 'PENDING'
                            );
                            const isMyTurn = currentActiveStep?.id === app.id;

                            return (
                              <div className='flex flex-col gap-1'>
                                <span className='inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 w-fit'>
                                  {isMyTurn ? 'Perlu Tindakan' : 'Menunggu'}
                                </span>
                                {!isMyTurn && currentActiveStep && (
                                  <span className='text-[8px] text-muted-foreground font-medium uppercase'>
                                    Nunggu {currentActiveStep.role?.name || 'Selanjutnya'}
                                  </span>
                                )}
                              </div>
                            );
                          }
                          
                          if (app.action === 'APPROVED') {
                            if (app.purchaseRequest.status === 'APPROVED') {
                              return (
                                <span className='inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'>
                                  Selesai
                                </span>
                              );
                            }
                            
                            const nextStep = app.purchaseRequest.approvals?.find(
                              (s: any) => s.action === 'PENDING'
                            );
                            
                            return (
                              <div className='flex flex-col gap-1'>
                                <span className='inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 w-fit'>
                                  Setuju
                                </span>
                                {nextStep && (
                                  <span className='text-[8px] text-muted-foreground font-medium uppercase'>
                                    Nunggu {nextStep.role?.name || 'Selanjutnya'}
                                  </span>
                                )}
                              </div>
                            );
                          }

                          return (
                            <span className='inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-red-100 text-red-700 dark:bg-red-900/30'>
                              Ditolak
                            </span>
                          );
                        })()}
                      </td>
                      <td className='py-4 px-3 text-right'>
                        {app.action === 'PENDING' ? (
                          <div className='flex items-center justify-end gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              className='h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(app);
                              }}
                            >
                              Tinjau
                            </Button>
                          </div>
                        ) : (
                          <div className='flex flex-col items-end'>
                            <span className='text-xs text-muted-foreground italic text-right'>
                              Processed by {app.actor?.name || 'System'}
                            </span>
                            <span className='text-[10px] text-muted-foreground'>
                              {new Date(app.actedAt).toLocaleDateString(
                                'id-ID',
                              )}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredApprovals.length === 0 && (
            <div className='text-center py-12 text-sm text-muted-foreground'>
              <AlertCircle className='w-8 h-8 mx-auto mb-2 text-zinc-400' />
              Kaga ada approval dengan status &quot;{activeTab}&quot;.
            </div>
          )}
        </CardContent>
      </Card>

      <ApprovalDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        approval={selectedApproval}
        onSuccess={fetchApprovals}
      />
    </>
  );
};

export default ApprovalsPage;
