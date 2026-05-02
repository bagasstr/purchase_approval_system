import {
  getDashboardStatsAction,
} from '@/features/dashboard/actions/dashboardAction';
import DashboardContent from '@/features/dashboard/components/DashboardContent';

export const dynamic = 'force-dynamic';


export default async function DashboardPage() {
  const data = await getDashboardStatsAction();

  return <DashboardContent data={data} />;
}
