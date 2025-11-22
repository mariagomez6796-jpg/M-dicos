"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Stethoscope, MapPin, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Importamos las funciones REALES (¡solo 'get' y 'cancel'!)
import { getPatientAppointments, cancelPatientAppointment } from "@/services/citas.service"

/**
 * Función Clave (VERSIÓN FINAL):
 * Busca el ID del paciente en localStorage.
 */
const getPatientIdFromAuth = (): number | null => {
  console.log("AUTH: Buscando ID de paciente en localStorage...");
  try {
    const directId = localStorage.getItem('user_id') || localStorage.getItem('patient_id') || localStorage.getItem('userId');
    if (directId && !isNaN(Number(directId))) {
      console.log(`AUTH: ¡Éxito! ID encontrado (key 'user_id' o similar): ${directId}`);
      return Number(directId);
    }

    const userInfoString = localStorage.getItem('user') || localStorage.getItem('userInfo'); 
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        const idFromObject = userInfo.id || userInfo.patient_id || userInfo.user_id;
        
        if (idFromObject && !isNaN(Number(idFromObject))) {
          console.log(`AUTH: ¡Éxito! ID encontrado dentro de un objeto 'user': ${idFromObject}`);
          return Number(idFromObject);
        }
      } catch (e) {
        console.warn("AUTH: 'user' no es un objeto JSON, o no tiene ID.");
      }
    }

    console.error("AUTH: ¡FRACASO! No se pudo encontrar el ID del paciente en localStorage.");
    console.log("LocalStorage keys:", Object.keys(localStorage)); 
    return null;

  } catch (error) {
    console.error("AUTH: --- ¡¡ERROR CATASTRÓFICO EN localStorage!! ---", error);
    return null;
  }
};

// Mapeo de estados: Solo nos importa PENDING
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

export function MyAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast()

  // Función para cargar los datos desde la API
  const fetchAppointments = async () => {
    const patientId = getPatientIdFromAuth();
    if (!patientId) {
      setError("No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Pedimos SÓLO las citas 'PENDING'
      const data = await getPatientAppointments(patientId, "PENDING"); 
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

  const handleCancelAppointment = async (appointmentId: number) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;

    try {
      // 1. Llama a la API para cancelar
      await cancelPatientAppointment(appointmentId);
      
      // 2. ¡Éxito! Ahora quita la cita de la lista de la UI al instante
      setAppointments(prev => 
        prev.filter(apt => apt.id !== appointmentId) 
      );
      
      toast({
        title: "Cita cancelada",
        description: "Tu cita ha sido cancelada exitosamente.",
      })
    } catch (err: any) {
       toast({ title: "Error", description: err.message || "No se pudo cancelar la cita", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Mis Citas Pendientes</h2>
        <p className="text-muted-foreground">Consulta y cancela tus citas médicas programadas</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Cargando mis citas...</p>
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
            <p className="text-muted-foreground text-center p-8">No tienes citas pendientes.</p>
          ) : (
            
            appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.appointment_datetime);
              const statusInfo = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.PENDING;
              
              return (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{appointment.doctor_name}</CardTitle>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          {appointment.doctor_specialty}
                        </CardDescription>
                      </div>
                      
                      {/* El único botón ahora es Cancelar */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                        onClick={() => handleCancelAppointment(appointment.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground col-span-1 sm:col-span-2">
                        <MapPin className="w-4 h-4" />
                        <span>Consultorio (Detalles en la app)</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Motivo:</span> {appointment.reason}
                      </p>
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