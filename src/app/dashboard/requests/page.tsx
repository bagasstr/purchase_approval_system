'use client';

import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Search,
  MoreVertical,
  FileChartColumn,
  Eye,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import AddRequestForm from '@/features/requests/components/AddRequestForm';
import { RequestDetailModal } from '@/features/requests/components/RequestDetailModal';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { getAllRequestsAction } from '@/features/requests/actions/purchaseRequestAction';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { getRoleByIdAction } from '@/features/roles/actions/rolesAction';

const RequestPage = () => {
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: requests = [], isLoading: isRequestsLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: () => getAllRequestsAction(),
    enabled: !!session?.user,
  });

  const { data: userRole, isLoading: isRoleLoading } = useQuery({
    queryKey: ['userRole', session?.user?.id],
    queryFn: () => {
      const user = session?.user as any;
      return user?.roleId ? getRoleByIdAction(user.roleId) : null;
    },
    enabled: !!session?.user,
  });

  const loading = isRequestsLoading || isRoleLoading;

  const isAdmin = useMemo(() => {
    const roleName = userRole?.name?.toUpperCase();
    return roleName === 'ADMIN' || roleName === 'SUPER-ADMIN';
  }, [userRole]);

  const getStatusInfo = (req: any) => {
    if (req.status === 'REJECTED') {
      return { label: 'Ditolak', class: 'bg-red-100 text-red-800' };
    }
    if (req.status === 'APPROVED') {
      return { label: 'Selesai', class: 'bg-emerald-100 text-emerald-800' };
    }

    if (req.status === 'PENDING') {

      const currentStep = req.approvals?.find(
        (step: any) => step.action === 'PENDING',
      );

      if (!currentStep && req.approvals?.length > 0) {
        return { label: 'Selesai', class: 'bg-emerald-100 text-emerald-800' };
      }

      return {
        label: currentStep
          ? `Menunggu ${currentStep.role?.name || 'Persetujuan'}`
          : 'Sedang Diproses',
        class: 'bg-amber-100 text-amber-800',
      };
    }
    return { label: req.status, class: 'bg-zinc-100 text-zinc-800' };
  };

  const filteredRequests = requests.filter((req) => {
    const isAllApproved =
      req.approvals?.length > 0 &&
      req.approvals.every((a: any) => a.action === 'APPROVED');

    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') {
      return req.status === 'PENDING' && !isAllApproved;
    }
    if (activeTab === 'Approved') {
      return req.status === 'APPROVED' || isAllApproved;
    }
    if (activeTab === 'Rejected') return req.status === 'REJECTED';
    return true;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleOpenDetail = (req: any) => {
    setSelectedRequest(req);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
        <Loader2 className='w-8 h-8 animate-spin mb-2' />
        <p>Mohon tunggu, sedang mengambil data...</p>
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            Daftar Permintaan
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Pantau dan kelola semua pengajuan pembelian Anda di sini.
          </p>
        </div>
        <div className='flex items-center gap-x-4'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size={'icon-sm'}
                variant={'outline'}
                className='cursor-pointer'
              >
                <FileChartColumn className='w-4 h-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              Export Laporan Request
            </TooltipContent>
          </Tooltip>
          {!isAdmin && <AddRequestForm isOpen={isOpen} setIsOpen={setIsOpen} />}
        </div>
      </div>
      
      {}
      {!isAdmin && session?.user && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <Card className='relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'>
            <div className='absolute top-0 right-0 p-4 opacity-10'>
              <FileChartColumn className='w-24 h-24' />
            </div>
            <CardHeader className='pb-2'>
              <CardDescription className='text-primary-foreground/70 text-xs font-bold uppercase tracking-wider'>
                Sisa Limit Anda
              </CardDescription>
              <CardTitle className='text-3xl font-black'>
                Rp {Number((session.user as any).approvalLimit || 0).toLocaleString('id-ID')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-[10px] text-primary-foreground/60 italic font-medium'>
                * Batas maksimal pengajuan yang bisa Anda buat.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6'>
          {}
          <div className='flex items-center gap-1 bg-muted/60 p-1 rounded-lg border'>
            {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  activeTab === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Cari permintaan...'
              className='w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse text-sm'>
              <thead>
                <tr className='border-b text-muted-foreground text-xs font-medium'>
                  <th className='pb-2 px-2'>ID / Item</th>
                  <th className='pb-2 px-2'>User / Dept</th>
                  <th className='pb-2 px-2'>Amount</th>
                  <th className='pb-2 px-2'>Status</th>
                  <th className='pb-2 px-2 text-right'>Aksi</th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {paginatedRequests.map((req, i) => {
                  const statusInfo = getStatusInfo(req);
                  return (
                    <tr
                      key={i}
                      className='hover:bg-muted/50 transition-colors cursor-pointer'
                      onClick={() => handleOpenDetail(req)}
                    >
                      <td className='py-3 px-2'>
                        <span className='text-[10px] font-mono text-muted-foreground'>
                          {req.requestNo}
                        </span>
                        <p className='font-medium text-sm'>{req.title}</p>
                      </td>
                      <td className='py-3 px-2'>
                        <p className='font-medium text-xs'>
                          {req.requester?.name}
                        </p>
                        <span className='text-[10px] text-muted-foreground'>
                          {req.department?.name}
                        </span>
                      </td>
                      <td className='py-3 px-2 font-semibold text-xs'>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        }).format(req.totalAmount)}
                      </td>
                      <td className='py-3 px-2'>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                            statusInfo?.class,
                          )}
                        >
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className='py-3 px-2 text-right'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-muted-foreground hover:text-primary'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(req);
                          }}
                        >
                          <Eye className='w-4 h-4' />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRequests.length === 0 && (
            <div className='text-center py-12 text-sm text-muted-foreground'>
              <AlertCircle className='w-8 h-8 mx-auto mb-2 text-zinc-400' />
              Tidak ada permintaan dengan status &quot;{activeTab}&quot;.
            </div>
          )}

          {}
          {totalPages > 1 && (
            <div className='flex items-center justify-between gap-2 mt-4 pt-4 border-t text-xs'>
              <span className='text-muted-foreground'>
                Menampilkan {startIndex + 1} -{' '}
                {Math.min(startIndex + itemsPerPage, filteredRequests.length)}{' '}
                dari {filteredRequests.length} permintaan
              </span>
              <div className='flex items-center gap-1'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size='sm'
                      className='w-8 h-8 p-0'
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RequestDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        request={selectedRequest}
      />
    </>
  );
};

export default RequestPage;
