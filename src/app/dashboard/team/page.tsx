'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Search,
  Users,
  Mail,
  Shield,
  Building,
  Loader2,
  Phone,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { getTeamMembersAction } from '@/features/users/actions/userAction';
import { toast } from 'sonner';

const TeamPage = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role?.name?.toUpperCase() === 'ADMIN' || 
                  session?.user?.role?.name?.toUpperCase() === 'SUPER-ADMIN';

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await getTeamMembersAction(session?.user?.departmentId);
      setMembers(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchTeam();
    }
  }, [session]);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground flex items-center gap-2'>
            <Users className='w-6 h-6 text-primary' /> Anggota Tim
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Daftar rekan kerja Anda {isAdmin ? 'di ' : 'di divisi '}
            <span className='font-bold text-foreground'>
              {isAdmin ? 'Semua Divisi' : members[0]?.department?.name || 'Departemen Anda'}
            </span>
            .
          </p>
        </div>
      </div>

      <Card className='backdrop-blur-sm bg-card/80 border-zinc-200/50 dark:border-zinc-800/50'>
        <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6'>
          <div>
            <CardTitle className='text-base font-semibold'>
              Anggota Tim
            </CardTitle>
            <CardDescription className='text-xs'>
              Ada {members.length} orang {isAdmin ? 'terdaftar di sistem' : 'di divisi lu'}.
            </CardDescription>
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
            <input
              type='text'
              placeholder='Cari rekan tim...'
              className='w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-20 text-muted-foreground'>
              <Loader2 className='w-8 h-8 animate-spin mb-2' />
              <p>Mohon tunggu, sedang memuat daftar anggota tim...</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    'group p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card hover:bg-muted/50 transition-all duration-200',
                    member.id === session?.user?.id &&
                      'border-primary/50 bg-primary/5',
                  )}
                >
                  <div className='flex items-start gap-4'>
                    <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg shrink-0'>
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <p className='font-bold text-sm truncate'>
                          {member.name}
                        </p>
                        {member.id === session?.user?.id && (
                          <span className='text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter'>
                            Anda
                          </span>
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate'>
                        <Mail className='w-3 h-3' /> {member.email}
                      </p>
                      {member.phone && (
                        <p className='text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5'>
                          <Phone className='w-3 h-3' /> {member.phone}
                        </p>
                      )}

                      <div className='flex flex-wrap gap-2 mt-3'>
                        <span className='inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border'>
                          <Shield className='w-3 h-3' />
                          {member.role?.name || 'KARYAWAN'}
                        </span>
                        <span className='inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border'>
                          <Building className='w-3 h-3' />
                          {member.department?.name || 'UMUM'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredMembers.length === 0 && (
            <div className='text-center py-12 text-sm text-muted-foreground'>
              Tidak ditemukan rekan tim yang Anda cari.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default TeamPage;
