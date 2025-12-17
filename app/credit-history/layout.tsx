import DashboardLayout from '@/components/layout/DashboardLayout';

export default function CreditHistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
