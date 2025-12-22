import { AdminRouteGuard } from '@/components/guards/AdminRouteGuard';
import UsersClient from './UsersClient';

export default function UsersPage() {
  return (
    <AdminRouteGuard>
      <UsersClient />
    </AdminRouteGuard>
  );
}
