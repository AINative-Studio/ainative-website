import { AdminRouteGuard } from '@/components/guards/AdminRouteGuard';
import AuditClient from './AuditClient';

export default function AuditPage() {
  return (
    <AdminRouteGuard>
      <AuditClient />
    </AdminRouteGuard>
  );
}
