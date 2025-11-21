"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DoctorDashboard } from "@/components/doctor/doctor-dashboard"

export default function DoctorPage() {
  return (
    <DashboardLayout allowedRoles={["doctor"]}>
      <DoctorDashboard />
    </DashboardLayout>
  )
}
