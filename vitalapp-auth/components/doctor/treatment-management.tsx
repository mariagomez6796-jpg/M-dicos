"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pill, Calendar, User, FileText } from "lucide-react"

const mockTreatments = [
  {
    id: "1",
    patient: "Juan Pérez",
    diagnosis: "Hipertensión",
    medications: ["Enalapril 10mg - 1 vez al día", "Hidroclorotiazida 25mg - 1 vez al día"],
    instructions: "Tomar con alimentos. Controlar presión arterial diariamente.",
    startDate: "2024-01-15",
    duration: "3 meses",
  },
  {
    id: "2",
    patient: "María López",
    diagnosis: "Migraña crónica",
    medications: ["Sumatriptán 50mg - según necesidad", "Propranolol 40mg - 2 veces al día"],
    instructions: "Evitar desencadenantes conocidos. Mantener diario de dolores de cabeza.",
    startDate: "2024-01-20",
    duration: "6 meses",
  },
]

export function TreatmentManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Gestión de Tratamientos</h2>
          <p className="text-muted-foreground">Agrega y administra tratamientos para tus pacientes</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Tratamiento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Tratamiento</DialogTitle>
              <DialogDescription>Completa los detalles del tratamiento para el paciente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient-select">Paciente</Label>
                <select
                  id="patient-select"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Seleccionar paciente...</option>
                  <option value="1">Juan Pérez</option>
                  <option value="2">María López</option>
                  <option value="3">Pedro Gómez</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnóstico</Label>
                <Input id="diagnosis" placeholder="Ej: Hipertensión arterial" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medications">Medicamentos</Label>
                <Textarea
                  id="medications"
                  placeholder="Lista de medicamentos con dosis y frecuencia&#10;Ej: Enalapril 10mg - 1 vez al día"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instrucciones</Label>
                <Textarea id="instructions" placeholder="Instrucciones especiales para el paciente" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Fecha de inicio</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración</Label>
                  <Input id="duration" placeholder="Ej: 3 meses" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Guardar Tratamiento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {mockTreatments.map((treatment) => (
          <Card key={treatment.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-lg">{treatment.patient}</CardTitle>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="secondary">{treatment.diagnosis}</Badge>
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Medicamentos
                </p>
                <ul className="space-y-1">
                  {treatment.medications.map((medication, index) => (
                    <li key={index} className="text-sm text-muted-foreground pl-6">
                      • {medication}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Instrucciones</p>
                <p className="text-sm text-muted-foreground">{treatment.instructions}</p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2 border-t text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Inicio: {treatment.startDate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Duración: {treatment.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
