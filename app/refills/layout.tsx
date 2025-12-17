import DashboardLayout from '@/components/layout/DashboardLayout';

export default function RefillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
