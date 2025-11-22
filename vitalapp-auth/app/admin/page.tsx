"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <AdminDashboard />
    </DashboardLayout>
  )
}
