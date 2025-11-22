"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Importamos las funciones REALES de tu servicio para el Doctor
import { getDoctorAppointments, updateDoctorAppointment } from "@/services/citas.service"

/**
 * Función Clave (¡LA REUTILIZAMOS!):
 * Busca el ID del usuario logueado (sea paciente o doctor) en localStorage.
 */
const getUserIdFromAuth = (): number | null => {
  console.log("AUTH: Buscando ID de usuario (Doctor) en localStorage...");
  try {
    const directId = localStorage.getItem('user_id') || localStorage.getItem('userId');
    if (directId && !isNaN(Number(directId))) {
      console.log(`AUTH: ¡Éxito! ID encontrado (key 'user_id'): ${directId}`);
      return Number(directId);
    }

    const userInfoString = localStorage.getItem('user') || localStorage.getItem('userInfo'); 
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        const idFromObject = userInfo.id || userInfo.user_id;
        
        if (idFromObject && !isNaN(Number(idFromObject))) {
          console.log(`AUTH: ¡Éxito! ID encontrado dentro de un objeto 'user': ${idFromObject}`);
          return Number(idFromObject);
        }
      } catch (e) {
        console.warn("AUTH: 'user' no es un objeto JSON, o no tiene ID.");
      }
    }

    console.error("AUTH: ¡FRACASO! No se pudo encontrar el ID del usuario en localStorage.");
    console.log("LocalStorage keys:", Object.keys(localStorage)); 
    return null;

  } catch (error) {
    console.error("AUTH: --- ¡¡ERROR CATASTRÓFICO EN localStorage!! ---", error);
    return null;
  }
};

// Mapeo de estados (solo nos importa 'PENDING' para esta vista)
const statusConfig = {
  PENDING: { label: "Pendiente", variant: "secondary" as const },
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

export function PendingAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast()

  // Función para cargar los datos desde la API
  const fetchAppointments = async () => {
    const doctorId = getUserIdFromAuth(); // Obtenemos el ID del Doctor logueado
    if (!doctorId) {
      setError("No se pudo identificar al doctor. Por favor, inicie sesión de nuevo.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Pedimos SÓLO las citas 'PENDING' para este doctor
      const data = await getDoctorAppointments(doctorId, "PENDING"); 
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
  }, []);

  // --- ¡¡NUEVA!! Función para CAMBIAR ESTADO (Completar o Cancelar) ---
  const handleUpdateStatus = async (appointmentId: number, newStatus: "COMPLETED" | "CANCELLED") => {
    
    const actionText = newStatus === "COMPLETED" ? "completar" : "cancelar";
    if (!confirm(`¿Estás seguro de que deseas ${actionText} esta cita?`)) return;

    try {
      // 1. Llama a la API para actualizar el estado
      await updateDoctorAppointment(appointmentId, newStatus);
      
      // 2. ¡Éxito! Ahora quita la cita de la lista de la UI (porque ya no está 'PENDING')
      setAppointments(prev => 
        prev.filter(apt => apt.id !== appointmentId) 
      );
      
      toast({
        title: `Cita ${newStatus === "COMPLETED" ? 'Completada' : 'Cancelada'}`,
        description: `La cita ha sido marcada como ${actionText}a.`,
      })
    } catch (err: any) {
       toast({ title: "Error", description: err.message || `No se pudo ${actionText} la cita`, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Citas Pendientes</h2>
        <p className="text-muted-foreground">Gestiona y atiende las citas programadas de tus pacientes</p>
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
            <p className="text-muted-foreground text-center p-8">No tienes citas pendientes.</p>
          ) : (
            
            appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.appointment_datetime);
              const statusInfo = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.PENDING;
              
              return (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          {/* Usamos 'patient_name' que viene de la API */}
                          <CardTitle className="text-lg">{appointment.patient_name}</CardTitle>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <CardDescription>{appointment.reason}</CardDescription>
                      </div>
                      
                      {/* --- ¡¡BOTONES CONECTADOS!! --- */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                          // ¡¡Cambiado de 'Confirmar' a 'Completar'!!
                          onClick={() => handleUpdateStatus(appointment.id, "COMPLETED")}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleUpdateStatus(appointment.id, "CANCELLED")}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
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