import { AdminRouteGuard } from '@/components/guards/AdminRouteGuard';
import MonitoringClient from './MonitoringClient';

export default function MonitoringPage() {
  return (
    <AdminRouteGuard>
      <MonitoringClient />
    </AdminRouteGuard>
  );
}
