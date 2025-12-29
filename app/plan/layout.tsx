import DashboardLayout from '@/components/layout/DashboardLayout';

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
