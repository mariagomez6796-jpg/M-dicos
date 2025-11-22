const API_URL = "http://localhost:8003";


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

export interface Medicine {
  name: string;
  frequency: string;
  duration: string;
}

export interface Treatment {
  id?: number;
  appointment_id: number;
  patient_id?: number; 
  doctor_id?: number;  
  diagnosis: string;
  medicines: Medicine[];
  created_at?: string;
  doctor_name?: string; // Para vista paciente
  specialty?: string;   // Para vista paciente
}

// 1. Crear Tratamiento
export const createTreatment = async (data: Treatment) => {
  const res = await fetch(`${API_URL}/treatments`, {
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

// 2. Obtener Tratamientos (Paciente)
export const getPatientTreatments = async (patientId: number) => {
  const res = await fetch(`${API_URL}/patient/treatments/${patientId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return res.json();
};

// 3. Obtener Tratamiento por Cita (Doctor - para ver si ya existe)
export const getTreatmentByAppointment = async (appointmentId: number) => {
  const res = await fetch(`${API_URL}/treatment/by-appointment/${appointmentId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  // Si devuelve null (200 OK pero body null o vacío), retornamos null
  if (!res.ok) return null;
  
  // Manejo seguro de respuesta vacía
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

// 4. Editar Tratamiento
export const updateTreatment = async (treatmentId: number, data: Treatment) => {
  const res = await fetch(`${API_URL}/treatments/${treatmentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar receta");
  return res.json();
};