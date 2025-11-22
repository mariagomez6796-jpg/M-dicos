"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, Calendar, User, Download, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"


const API_TREATMENTS_URL = "http://localhost:8003";

interface Medicine {
  name: string;
  medicine_name?: string; // Respaldo por si la API varía
  frequency: string;
  duration: string;
}

interface Treatment {
  id: number;
  appointment_id: number;
  diagnosis: string;
  medicines: Medicine[];
  created_at: string;
  doctor_name: string;
  specialty: string;
}

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return token 
    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
    : { 'Content-Type': 'application/json' };
};

const getPatientTreatments = async (patientId: number) => {
  const res = await fetch(`${API_TREATMENTS_URL}/patient/treatments/${patientId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) return [];
  return res.json();
};

const getUserIdFromAuth = (): number | null => {
  try {
    const directId = localStorage.getItem('user_id') || localStorage.getItem('patient_id') || localStorage.getItem('userId');
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

// --- 2. COMPONENTE PRINCIPAL ---

export function PrescriptionsView() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      const patientId = getUserIdFromAuth();
      
      if (!patientId) {
        setError("No se pudo identificar al paciente. Inicia sesión nuevamente.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getPatientTreatments(patientId);
        setTreatments(data || []);
      } catch (err: any) {
        console.error(err);
        setError("Error al cargar las recetas.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Función para imprimir/descargar la receta
  const handleDownload = (treatment: Treatment) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receta Médica #${treatment.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .doctor { font-size: 1.2em; font-weight: bold; }
              .meta { margin-bottom: 30px; color: #555; }
              .diagnosis { background: #f0f0f0; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; }
              th { text-align: left; background: #eee; padding: 10px; border-bottom: 1px solid #ddd; }
              td { padding: 10px; border-bottom: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Receta Médica</h1>
              <div class="doctor">Dr. ${treatment.doctor_name}</div>
              <div>${treatment.specialty}</div>
            </div>
            <div class="meta">
              <p><strong>Fecha:</strong> ${format(new Date(treatment.created_at), "PPP", { locale: es })}</p>
              <p><strong>Folio Receta:</strong> #${treatment.id} (Cita #${treatment.appointment_id})</p>
            </div>
            <div class="diagnosis">
              <strong>Diagnóstico / Indicaciones:</strong><br/>
              ${treatment.diagnosis}
            </div>
            <h3>Medicamentos:</h3>
            <table>
              <thead><tr><th>Medicamento</th><th>Frecuencia</th><th>Duración</th></tr></thead>
              <tbody>
                ${treatment.medicines.map(m => `
                  <tr>
                    <td>${m.name || m.medicine_name}</td>
                    <td>${m.frequency}</td>
                    <td>${m.duration}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Cargando tus recetas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/50 text-destructive p-4 rounded-md flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Mis Recetas Médicas</h2>
        <p className="text-muted-foreground">Consulta y descarga los tratamientos prescritos por tus doctores</p>
      </div>

      {treatments.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No tienes recetas médicas registradas.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {treatments.map((treatment) => (
            <Card key={treatment.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      {/* Título ahora es el Diagnóstico */}
                      <CardTitle className="text-lg">{treatment.diagnosis}</CardTitle>
                      <Badge variant="outline">
                        Receta #{treatment.id}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Prescrito por Dr. {treatment.doctor_name} ({treatment.specialty})
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(treatment)}>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground pb-4 border-b">
                  <Calendar className="w-4 h-4" />
                  <span>Emitida el: {format(new Date(treatment.created_at), "PPP", { locale: es })}</span>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    Medicamentos Prescritos
                  </p>
                  <div className="space-y-3">
                    {treatment.medicines.map((medication, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          {/* Usamos name o medicine_name */}
                          <h4 className="font-semibold text-foreground">{medication.name || medication.medicine_name}</h4>
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

                
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
