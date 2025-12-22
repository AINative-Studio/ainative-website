import { AdminRouteGuard } from '@/components/guards/AdminRouteGuard';
import AdminDashboardClient from './AdminDashboardClient';

export default function AdminDashboardPage() {
  return (
    <AdminRouteGuard>
      <AdminDashboardClient />
    </AdminRouteGuard>
  );
}
