"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, FileText, History } from "lucide-react"
import { UserManagement } from "./user-management"
import { AppointmentsView } from "./appointments-view"
import { ReportsView } from "./reports-view"
import { PatientHistoryView } from "./patient-history-view"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Administración</h1>
        <p className="text-muted-foreground">Gestiona usuarios, citas y reportes del sistema</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Citas</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Reportes</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Historial</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <AppointmentsView />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsView />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <PatientHistoryView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
