"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, Stethoscope, CheckCircle, AlertCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Importa las funciones de tu nuevo servicio
import { getDoctors, getAvailableSlots, createAppointment } from "@/services/citas.service"

/**
 * Función Clave (VERSIÓN FINAL):
 * Busca el ID del paciente en localStorage.
 * ¡Busca la clave 'user_id' o el objeto 'user' que 'login-form' guarda!
 */
const getPatientIdFromAuth = (): number | null => {
  console.log("AUTH: Buscando ID de paciente en localStorage...");
  try {
    // Opción 1: ¿Está guardado directamente como 'user_id'? (¡Lo añadimos en el Login!)
    const directId = localStorage.getItem('user_id') || localStorage.getItem('patient_id') || localStorage.getItem('userId');
    if (directId && !isNaN(Number(directId))) {
      console.log(`AUTH: ¡Éxito! ID encontrado (key 'user_id' o similar): ${directId}`);
      return Number(directId);
    }

    // Opción 2: ¿Está DENTRO de un objeto 'user' o 'userInfo'?
    const userInfoString = localStorage.getItem('user') || localStorage.getItem('userInfo'); 
    if (userInfoString) {
      try {
        const userInfo = JSON.parse(userInfoString);
        // ¡Lo añadimos en el Login, ahora debería existir userInfo.id!
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

export function AppointmentBooking() {
  const { toast } = useToast();
  
  // Estados para el formulario
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  
  // Estados de UI
  const [isBooked, setIsBooked] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- 1. Cargar Doctores (desde TU API) al iniciar ---
  useEffect(() => {
    const fetchDoctorsFromApi = async () => {
      setIsLoadingDoctors(true);
      setError(null);
      try {
        const data = await getDoctors();
        setDoctors(data || []);
      } catch (err: any) {
        console.error("Error al obtener los doctores:", err);
        setError("No se pudieron cargar los doctores. Intenta de nuevo.");
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctorsFromApi();
  }, [toast]);

  // --- 2. Cargar Horarios (Slots) cuando el doctor o la fecha cambian ---
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setError(null);
      setAvailableSlots([]);
      setSelectedSlot(null);
      
      try {
        const dateString = format(selectedDate, "yyyy-MM-dd");
        const data = await getAvailableSlots(selectedDoctor.id, dateString);
        setAvailableSlots(data.available_slots || []);
      } catch (err: any) {
        console.error("Error al obtener los horarios:", err);
        setError("No se pudieron cargar los horarios para este día.");
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor, selectedDate, toast]);


  // --- 3. Manejar el envío final (Agendar Cita) ---
  const handleBookingSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !reason) {
      toast({ title: "Faltan datos", description: "Por favor, completa todos los pasos.", variant: "destructive" });
      return;
    }
    
    // ¡Aquí está la magia! (Restaurado a la versión final)
    const patientId = getPatientIdFromAuth();
    if (!patientId) {
      toast({ title: "Error de autenticación", description: "No pudimos identificar tu usuario. Por favor, vuelve a iniciar sesión.", variant: "destructive" });
      return;
    }
    
    setIsBooking(true);
    setError(null);
    
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      const appointmentDatetime = `${dateString}T${selectedSlot}`;

      await createAppointment({
        patient_id: patientId, // <-- ¡Ahora usará el ID real!
        doctor_id: selectedDoctor.id,
        appointment_datetime: appointmentDatetime,
        reason: reason,
      });

      // ¡Éxito!
      setIsBooked(true);
      setTimeout(() => {
        setIsBooked(false);
        setSelectedDoctor(null);
        setSelectedDate(new Date());
        setSelectedSlot(null);
        setReason("");
      }, 5000); 

    } catch (err: any) {
      console.error("Error al crear la cita:", err);
      setError(err.message || "Un error ocurrió al agendar tu cita.");
      toast({ title: "Error al agendar", description: err.message, variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };
  
  const doctor = selectedDoctor;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Agendar Nueva Cita</h2>
        <p className="text-muted-foreground">
          {isBooked ? "Tu cita ha sido confirmada." : "Completa los 4 pasos para agendar tu consulta"}
        </p>
      </div>

      {isBooked ? (
        // --- Pantalla de Éxito ---
        <Card className="border-green-600 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <div className="bg-green-600 rounded-full p-4">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">¡Cita Agendada!</h3>
                <p className="text-green-700">Tu cita ha sido confirmada exitosamente.</p>
                <p className="text-sm text-green-600 mt-4">
                  Doctor: {doctor?.name} ({doctor?.specialty})<br />
                  Fecha: {format(selectedDate!, "PPP", { locale: es })} a las {selectedSlot}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // --- Formulario de 4 Pasos ---
        <>
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <p>{error}</p>
            </div>
          )}

          {/* --- Paso 1: Seleccionar médico --- */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Paso 1: Selecciona un médico</h3>
            {isLoadingDoctors ? (
              <p className="text-muted-foreground">Cargando doctores...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`cursor-pointer transition-all ${
                      selectedDoctor?.id === doc.id ? "ring-2 ring-primary" : "hover:border-primary"
                    }`}
                    onClick={() => setSelectedDoctor(doc)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{doc.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        {doc.specialty}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={selectedDoctor?.id === doc.id ? "default" : "secondary"}>
                        {selectedDoctor?.id === doc.id ? "Seleccionado" : "Seleccionar"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* --- Paso 2: Seleccionar Fecha --- */}
          {selectedDoctor && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Paso 2: Selecciona una fecha</h3>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Deshabilita días pasados
                  className="rounded-md border"
                  locale={es} // ¡Calendario en español!
                />
              </div>
            </div>
          )}

          {/* --- Paso 3: Seleccionar Hora --- */}
          {selectedDoctor && selectedDate && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Paso 3: Selecciona una hora disponible</h3>
              {isLoadingSlots ? (
                <p className="text-muted-foreground">Buscando horarios...</p>
              ) : availableSlots.length > 0 ? (
                <Select onValueChange={setSelectedSlot} value={selectedSlot ?? ""}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground">No hay horarios disponibles para este día. Por favor, selecciona otra fecha.</p>
              )}
            </div>
          )}
          
          {/* --- Paso 4: Razón y Confirmar --- */}
          {selectedDoctor && selectedDate && selectedSlot && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Paso 4: Motivo de la consulta</h3>
              <div>
                <Label htmlFor="reason">Motivo de la cita</Label>
                <Textarea
                  id="reason"
                  placeholder="Describe brevemente el motivo de tu visita..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleBookingSubmit}
                disabled={isBooking || !reason}
              >
                {isBooking ? "Agendando..." : "Confirmar Cita"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}