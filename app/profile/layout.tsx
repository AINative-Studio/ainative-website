import React from "react";

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
