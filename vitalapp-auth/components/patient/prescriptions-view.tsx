"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, Calendar, User, Download, AlertCircle } from "lucide-react"

const mockPrescriptions = [
  {
    id: "1",
    doctor: "Dr. María García",
    date: "2024-01-15",
    diagnosis: "Hipertensión",
    medications: [
      { name: "Enalapril", dose: "10mg", frequency: "1 vez al día", duration: "3 meses" },
      { name: "Hidroclorotiazida", dose: "25mg", frequency: "1 vez al día", duration: "3 meses" },
    ],
    instructions: "Tomar con alimentos. Controlar presión arterial diariamente.",
    status: "active",
  },
  {
    id: "2",
    doctor: "Dr. Carlos Ruiz",
    date: "2024-01-10",
    diagnosis: "Infección respiratoria",
    medications: [
      { name: "Amoxicilina", dose: "500mg", frequency: "3 veces al día", duration: "7 días" },
      { name: "Ibuprofeno", dose: "400mg", frequency: "Cada 8 horas", duration: "5 días" },
    ],
    instructions: "Completar el tratamiento completo de antibióticos. Descansar y mantenerse hidratado.",
    status: "completed",
  },
]

const statusConfig = {
  active: { label: "Activa", variant: "default" as const },
  completed: { label: "Completada", variant: "outline" as const },
}

export function PrescriptionsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Mis Recetas Médicas</h2>
        <p className="text-muted-foreground">Consulta tus recetas y tratamientos prescritos</p>
      </div>

      <div className="grid gap-6">
        {mockPrescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{prescription.diagnosis}</CardTitle>
                    <Badge variant={statusConfig[prescription.status as keyof typeof statusConfig].variant}>
                      {statusConfig[prescription.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Prescrito por {prescription.doctor}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4 border-b">
                <Calendar className="w-4 h-4" />
                <span>Fecha de emisión: {prescription.date}</span>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Medicamentos Prescritos
                </p>
                <div className="space-y-3">
                  {prescription.medications.map((medication, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{medication.name}</h4>
                        <Badge variant="secondary">{medication.dose}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">Frecuencia:</span> {medication.frequency}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Duración:</span> {medication.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Instrucciones Especiales
                </p>
                <p className="text-sm text-blue-800">{prescription.instructions}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
