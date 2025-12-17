import DashboardLayout from '@/components/layout/DashboardLayout';

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
