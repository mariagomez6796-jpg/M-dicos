"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PatientDashboard } from "@/components/patient/patient-dashboard"

export default function PatientPage() {
  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <PatientDashboard />
    </DashboardLayout>
  )
}
