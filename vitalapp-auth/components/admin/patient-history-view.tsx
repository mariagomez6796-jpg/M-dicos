"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Calendar, FileText, Pill, Activity } from "lucide-react"

const mockPatientHistory = [
  {
    id: "1",
    patient: "Juan Pérez",
    email: "juan.perez@email.com",
    lastVisit: "2024-01-15",
    totalVisits: 8,
    diagnoses: ["Hipertensión", "Diabetes tipo 2"],
    currentMedications: ["Metformina", "Enalapril"],
    allergies: ["Penicilina"],
  },
  {
    id: "2",
    patient: "María López",
    email: "maria.lopez@email.com",
    lastVisit: "2024-01-20",
    totalVisits: 5,
    diagnoses: ["Asma"],
    currentMedications: ["Salbutamol"],
    allergies: [],
  },
  {
    id: "3",
    patient: "Pedro Gómez",
    email: "pedro.gomez@email.com",
    lastVisit: "2024-01-18",
    totalVisits: 12,
    diagnoses: ["Artritis reumatoide", "Hipertensión"],
    currentMedications: ["Metotrexato", "Losartán"],
    allergies: ["Aspirina"],
  },
]

export function PatientHistoryView() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Historial de Pacientes</h2>
        <p className="text-muted-foreground">Accede al historial médico completo de los pacientes</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6">
        {mockPatientHistory.map((patient) => (
          <Card key={patient.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{patient.patient}</CardTitle>
                  <CardDescription>{patient.email}</CardDescription>
                </div>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Historial Completo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Última visita:</span>
                  <span className="font-medium">{patient.lastVisit}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Total de visitas:</span>
                  <span className="font-medium">{patient.totalVisits}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Diagnósticos</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.diagnoses.map((diagnosis, index) => (
                      <Badge key={index} variant="secondary">
                        {diagnosis}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Medicamentos Actuales
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {patient.currentMedications.map((medication, index) => (
                      <Badge key={index} variant="outline">
                        {medication}
                      </Badge>
                    ))}
                  </div>
                </div>

                {patient.allergies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Alergias</p>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
