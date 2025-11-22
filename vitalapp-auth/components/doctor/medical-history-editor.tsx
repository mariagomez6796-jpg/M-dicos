"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Edit, Calendar, FileText, AlertCircle } from "lucide-react"

const mockPatients = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    lastUpdate: "2024-01-15",
    diagnoses: ["Hipertensión", "Diabetes tipo 2"],
    allergies: ["Penicilina"],
    notes: "Paciente con buen control de presión arterial. Requiere seguimiento mensual de glucosa.",
  },
  {
    id: "2",
    name: "María López",
    email: "maria.lopez@email.com",
    lastUpdate: "2024-01-20",
    diagnoses: ["Migraña crónica"],
    allergies: [],
    notes: "Responde bien al tratamiento preventivo. Mantener diario de dolores de cabeza.",
  },
]

export function MedicalHistoryEditor() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<(typeof mockPatients)[0] | null>(null)

  const handleEdit = (patient: (typeof mockPatients)[0]) => {
    setSelectedPatient(patient)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Historial Médico</h2>
        <p className="text-muted-foreground">Consulta y modifica el historial médico de tus pacientes</p>
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
        {mockPatients.map((patient) => (
          <Card key={patient.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{patient.name}</CardTitle>
                  <CardDescription>{patient.email}</CardDescription>
                </div>
                <Button variant="outline" onClick={() => handleEdit(patient)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modificar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Última actualización: {patient.lastUpdate}</span>
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

                {patient.allergies.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Alergias
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notas Clínicas
                  </p>
                  <p className="text-sm text-muted-foreground">{patient.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modificar Historial Médico</DialogTitle>
            <DialogDescription>Actualiza la información médica de {selectedPatient?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-diagnoses">Diagnósticos</Label>
              <Textarea
                id="edit-diagnoses"
                placeholder="Ingresa los diagnósticos separados por comas"
                defaultValue={selectedPatient?.diagnoses.join(", ")}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-allergies">Alergias</Label>
              <Input
                id="edit-allergies"
                placeholder="Ingresa las alergias separadas por comas"
                defaultValue={selectedPatient?.allergies.join(", ")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notas Clínicas</Label>
              <Textarea
                id="edit-notes"
                placeholder="Notas y observaciones sobre el paciente"
                defaultValue={selectedPatient?.notes}
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-entry">Agregar Nueva Entrada</Label>
              <Textarea id="new-entry" placeholder="Describe la nueva entrada al historial médico" rows={4} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
