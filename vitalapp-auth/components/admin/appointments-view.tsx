"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Stethoscope, MapPin, AlertCircle, Loader2, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// ¡Importamos la función REAL para el Admin!
import { getAllPendingAppointments } from "@/services/citas.service"

// Mapeo de estados (solo veremos PENDING)
const statusConfig = {
  PENDING: { label: "Pendiente", variant: "secondary" as const },
  COMPLETED: { label: "Completada", variant: "outline" as const },
  CANCELLED: { label: "Cancelada", variant: "destructive" as const },
}

// Función para formatear la fecha/hora
const formatDateTime = (datetimeStr: string) => {
  try {
    const dt = new Date(datetimeStr);
    return {
      date: format(dt, "PPP", { locale: es }), // "25 de enero de 2024"
      time: format(dt, "p", { locale: es }), // "10:00 AM"
    }
  } catch {
    return { date: "Fecha inválida", time: "Hora inválida" }
  }
}

export function AppointmentsView() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast()

  // Función para cargar los datos desde la API
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ¡Llamamos a la función original que solo trae PENDIENTES!
      const data = await getAllPendingAppointments(); 
      setAppointments(data || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar las citas.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchAppointments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // El array vacío asegura que solo se ejecute UNA VEZ

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Citas Pendientes (Admin)</h2>
        <p className="text-muted-foreground">Vista de todas las citas pendientes de aprobación en el sistema</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Cargando citas pendientes...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid gap-4">
          
          {appointments.length === 0 ? (
            <p className="text-muted-foreground text-center p-8">No hay citas pendientes en el sistema.</p>
          ) : (
            
            appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.appointment_datetime);
              // Deberían ser todas 'PENDING', pero usamos el config por si acaso
              const statusInfo = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.PENDING;
              
              return (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-1">
                        
                        {/* ¡Usamos los datos reales de la API! */}
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="w-5 h-5" />
                          {appointment.patient_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 pl-1">
                          <Stethoscope className="w-4 h-4" />
                          Cita con: {appointment.doctor_name} ({appointment.doctor_specialty})
                        </CardDescription>
                      </div>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Consultorio (Detalles en la app)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}