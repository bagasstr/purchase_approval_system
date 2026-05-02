import { Sidebar } from '@/features/dashboard/components/Sidebar';
import { Header } from '@/features/dashboard/components/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-background text-foreground font-sans flex'>
      {/* Sidebar - Fix di kiri */}
      <Sidebar />

      {/* Main Layout Wrapper */}
      <div className='flex-1 ml-64 flex flex-col min-h-screen'>
        {/* Header (Notif, Profile) */}
        <Header />

        {/* Content Area dengan Padding */}
        <main className='flex-1 p-8 transition-all duration-300 ease-in-out'>
          {children}
        </main>
      </div>
    </div>
  );
}
