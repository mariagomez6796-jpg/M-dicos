"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, TrendingUp, TrendingDown } from "lucide-react"

const mockReports = [
  {
    id: "1",
    doctor: "Dr. María García",
    specialty: "Cardiología",
    month: "Enero 2024",
    totalAppointments: 45,
    completedAppointments: 42,
    canceledAppointments: 3,
    patientSatisfaction: 4.8,
    trend: "up",
  },
  {
    id: "2",
    doctor: "Dr. Carlos Ruiz",
    specialty: "Pediatría",
    month: "Enero 2024",
    totalAppointments: 62,
    completedAppointments: 58,
    canceledAppointments: 4,
    patientSatisfaction: 4.9,
    trend: "up",
  },
  {
    id: "3",
    doctor: "Dra. Ana Martínez",
    specialty: "Dermatología",
    month: "Enero 2024",
    totalAppointments: 38,
    completedAppointments: 35,
    canceledAppointments: 3,
    patientSatisfaction: 4.6,
    trend: "down",
  },
]

export function ReportsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Reportes de Médicos</h2>
          <p className="text-muted-foreground">Estadísticas y rendimiento de los médicos del sistema</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Todo
        </Button>
      </div>

      <div className="grid gap-6">
        {mockReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{report.doctor}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="secondary">{report.specialty}</Badge>
                    <span className="flex items-center gap-1 text-xs">
                      <Calendar className="w-3 h-3" />
                      {report.month}
                    </span>
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Detalle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total de Citas</p>
                  <p className="text-2xl font-bold text-foreground">{report.totalAppointments}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">{report.completedAppointments}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Canceladas</p>
                  <p className="text-2xl font-bold text-red-600">{report.canceledAppointments}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Satisfacción</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-foreground">{report.patientSatisfaction}</p>
                    {report.trend === "up" ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
