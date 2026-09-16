import { getDashboardData } from "@/lib/data/provider-dashboard";
import {
  BusinessOverview,
  MissingProvider,
} from "@/components/dashboard/business-overview";
export default async function DashboardPage() {
  const data = await getDashboardData();
  return data ? <BusinessOverview data={data} /> : <MissingProvider />;
}
