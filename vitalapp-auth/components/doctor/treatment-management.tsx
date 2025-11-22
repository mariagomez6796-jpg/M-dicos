"use client"

import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Pill, Calendar, User, FileText, Loader2, Trash2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// --- 1. DEFINICIONES LOCALES DE SERVICIOS ---

const API_TREATMENTS_URL = "http://localhost:8003";
const API_CITAS_URL = "http://localhost:8001";

interface Medicine {
  name: string;
  medicine_name?: string; // <--- ¡EL SALVAVIDAS! (Para leer datos del backend viejo)
  frequency: string;
  duration: string;
}

interface Treatment {
  id?: number;
  appointment_id: number;
  patient_id?: number; 
  doctor_id?: number;
  diagnosis: string;
  medicines: Medicine[];
  created_at?: string;
  doctor_name?: string;
  specialty?: string;
  patient_name?: string;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- Funciones de API ---

const createTreatment = async (data: Treatment) => {
  const res = await fetch(`${API_TREATMENTS_URL}/treatments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Error al crear receta");
  }
  return res.json();
};

const updateTreatment = async (treatmentId: number, data: Treatment) => {
  const res = await fetch(`${API_TREATMENTS_URL}/treatments/${treatmentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar receta");
  return res.json();
};

const getDoctorTreatments = async (doctorId: number) => {
  const res = await fetch(`${API_TREATMENTS_URL}/doctor/treatments/${doctorId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
};

const getDoctorAppointments = async (doctorId: number, status: string = "PENDING") => {
   const res = await fetch(`${API_CITAS_URL}/doctor/appointments/${doctorId}?status=${status}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
}

// --- FIN DEFINICIONES LOCALES ---

const getUserIdFromAuth = (): number | null => {
  try {
    const directId = localStorage.getItem('user_id') || localStorage.getItem('userId');
    if (directId && !isNaN(Number(directId))) return Number(directId);
    
    const userInfoString = localStorage.getItem('user') || localStorage.getItem('userInfo'); 
    if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        const id = userInfo.id || userInfo.user_id;
        if (id) return Number(id);
    }
    return null;
  } catch { return null; }
};

export function TreatmentManagement() {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)    
  const [loadingList, setLoadingList] = useState(true)
  
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [completedAppointments, setCompletedAppointments] = useState<any[]>([])
  
  const [isEditing, setIsEditing] = useState(false)
  const [currentTreatmentId, setCurrentTreatmentId] = useState<number | null>(null)
  
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [medicines, setMedicines] = useState<Medicine[]>([{ name: "", frequency: "", duration: "" }])

  useEffect(() => {
    const id = getUserIdFromAuth();
    if (id) {
      setDoctorId(id);
      loadTreatments(id);
    } else {
      setLoadingList(false);
      toast({ title: "Error", description: "No se pudo identificar al doctor.", variant: "destructive" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTreatments = async (id: number) => {
    setLoadingList(true);
    try {
      const data = await getDoctorTreatments(id);
      setTreatments(data || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudieron cargar los tratamientos.", variant: "destructive" });
    } finally {
      setLoadingList(false);
    }
  };

  // --- FILTRO DE CITAS (Lógica de desaparición) ---
  const loadCompletedAppointments = async () => {
    if (!doctorId) return;
    try {
      const data = await getDoctorAppointments(doctorId, "COMPLETED");
      
      // Filtramos: Solo mostramos citas que NO tengan ya un tratamiento en la lista
      const availableAppointments = data.filter((app: any) => 
        !treatments.some(t => t.appointment_id === app.id)
      );

      setCompletedAppointments(availableAppointments || []);
    } catch (err) {
      console.error("Error cargando citas", err);
      toast({ title: "Aviso", description: "No se pudieron cargar las citas completadas.", variant: "destructive" });
    }
  };

  const handleOpenNew = () => {
    setIsEditing(false);
    setCurrentTreatmentId(null);
    setSelectedAppointmentId("");
    setDiagnosis("");
    setMedicines([{ name: "", frequency: "", duration: "" }]);
    
    loadCompletedAppointments(); 
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (treatment: Treatment) => {
    setIsEditing(true);
    setCurrentTreatmentId(treatment.id!);
    setSelectedAppointmentId(treatment.appointment_id.toString());
    setDiagnosis(treatment.diagnosis);
    setMedicines(treatment.medicines.length > 0 ? treatment.medicines : [{ name: "", frequency: "", duration: "" }]);
    setIsDialogOpen(true);
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: "", frequency: "", duration: "" }])
  }
  const handleRemoveMedicine = (index: number) => {
    const list = [...medicines]
    list.splice(index, 1)
    setMedicines(list)
  }
  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const list = [...medicines]
    list[index][field] = value
    setMedicines(list)
  }

  const handleSave = async () => {
    if (!selectedAppointmentId) { 
        toast({ title: "Error", description: "Debes seleccionar una cita.", variant: "destructive" })
        return
    }
    if (!diagnosis.trim()) {
        toast({ title: "Error", description: "El diagnóstico es obligatorio", variant: "destructive" })
        return
    }
    // Validación corregida para aceptar medicine_name también
    const validMeds = medicines.filter(m => (m.name && m.name.trim() !== "") || (m.medicine_name && m.medicine_name.trim() !== ""));
    if (validMeds.length === 0) {
        toast({ title: "Error", description: "Agrega al menos un medicamento con nombre", variant: "destructive" })
        return
    }

    setLoading(true)

    const payload: Treatment = {
        appointment_id: Number(selectedAppointmentId),
        diagnosis: diagnosis,
        medicines: validMeds,
    }

    try {
        if (isEditing && currentTreatmentId) {
            await updateTreatment(currentTreatmentId, payload);
            toast({ title: "Éxito", description: "Tratamiento actualizado correctamente." });
        } else {
            await createTreatment(payload);
            toast({ title: "Éxito", description: "Tratamiento creado correctamente." });
        }
        
        setIsDialogOpen(false);
        if (doctorId) loadTreatments(doctorId); 

    } catch (error: any) {
        if (error.message?.includes("409") || error.message?.includes("existe")) {
             toast({ title: "Error", description: "Ya existe una receta para esta cita.", variant: "destructive" });
        } else {
             toast({ title: "Error", description: error.message || "No se pudo guardar.", variant: "destructive" });
        }
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Gestión de Tratamientos</h2>
          <p className="text-muted-foreground">Crea y edita recetas médicas para tus citas completadas</p>
        </div>
        
        <Button onClick={handleOpenNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Tratamiento
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Tratamiento" : "Crear Nuevo Tratamiento"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Modifica la receta existente." : "Selecciona una cita completada para generar la receta."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              
              <div className="space-y-2">
                <Label>Cita Completada</Label>
                {isEditing ? (
                    <Input disabled value={`Cita ID: ${selectedAppointmentId}`} />
                ) : (
                    <Select onValueChange={setSelectedAppointmentId} value={selectedAppointmentId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una cita..." />
                    </SelectTrigger>
                    <SelectContent>
                        {completedAppointments.length === 0 ? (
                            <SelectItem value="0" disabled>No hay citas nuevas disponibles</SelectItem>
                        ) : (
                            completedAppointments.map((cita) => (
                                <SelectItem key={cita.id} value={cita.id.toString()}>
                                    #{cita.id} - {cita.patient_name} ({format(new Date(cita.appointment_datetime), "dd/MM/yyyy")})
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                    </Select>
                )}
                {!isEditing && <p className="text-xs text-muted-foreground">Solo aparecen citas completadas que aún no tienen receta.</p>}
              </div>

              <div className="space-y-2">
                <Label>Diagnóstico</Label>
                <Textarea 
                    placeholder="Ej: Infección respiratoria aguda" 
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Medicamentos</Label>
                    <Button variant="outline" size="sm" onClick={handleAddMedicine}>
                        <Plus className="w-4 h-4 mr-1" /> Agregar
                    </Button>
                </div>
                
                {medicines.map((med, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end bg-muted/30 p-2 rounded-md mb-2">
                        <div className="col-span-5">
                            <Label className="text-xs">Nombre</Label>
                            <Input 
                                // --- ¡¡ESTO ES LA MAGIA!! ---
                                // Usamos name (para nuevos) o medicine_name (para los que vienen de la BD)
                                value={med.name || med.medicine_name || ""} 
                                onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} 
                                placeholder="Nombre..."
                            />
                        </div>
                        <div className="col-span-3">
                            <Label className="text-xs">Frecuencia</Label>
                            <Input 
                                value={med.frequency} 
                                onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                placeholder="Ej: 8 hrs"
                            />
                        </div>
                        <div className="col-span-3">
                            <Label className="text-xs">Duración</Label>
                            <Input 
                                value={med.duration} 
                                onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                placeholder="Ej: 5 días"
                            />
                        </div>
                        <div className="col-span-1 flex justify-center">
                             <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleRemoveMedicine(index)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
              </div>

            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* --- LISTA DE TRATAMIENTOS --- */}
      {loadingList ? (
         <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>
      ) : treatments.length === 0 ? (
         <div className="text-center p-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-2">No has creado tratamientos aún.</p>
            <p className="text-sm text-muted-foreground">Completa una cita y haz clic en "Nuevo Tratamiento" para empezar.</p>
         </div>
      ) : (
        <div className="grid gap-6">
          {treatments.map((treatment) => (
            <Card key={treatment.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <CardTitle className="text-lg">{treatment.patient_name || "Paciente"}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="secondary">{treatment.diagnosis}</Badge>
                      <span className="text-xs text-muted-foreground">Cita #{treatment.appointment_id}</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(treatment)}>
                    <Edit className="w-4 h-4 mr-2" />
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
                    {treatment.medicines.map((medication, index) => (
                      <li key={index} className="text-sm text-muted-foreground pl-6">
                        {/* --- ¡¡AQUÍ ESTÁ LA CORRECCIÓN FINAL!! --- */}
                        {/* Si 'name' está vacío, usa 'medicine_name'. ¡Problema resuelto! */}
                        • <span className="font-medium">{medication.name || medication.medicine_name}</span> ({medication.frequency} por {medication.duration})
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-2 border-t text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Creado: {treatment.created_at ? format(new Date(treatment.created_at), "PPP", { locale: es }) : "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}