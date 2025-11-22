// Define la URL base de TU API de citas usando la variable de entorno
// Esta URL debe ser la que SÍ funciona (la del nombre del servicio en Docker)
// Define la URL base de TU API de citas
// ¡¡Hardcodeada a la URL pública para evitar errores de caché de Next.js!!
const API_CITAS_URL = "http://localhost:8001";

 /**
 * Función auxiliar para manejar las respuestas fetch
 */
const handleResponse = async (response: Response) => {
  if (response.ok) {
    // Si no hay contenido (ej: DELETE exitoso), devuelve un objeto vacío
   if (response.status === 204) {
      return {};
    }
    // Si hay un 200 OK pero sin contenido (pasa a veces)
    const text = await response.text();
    if (!text) {
      return { message: "Operación exitosa" };
    }
    return JSON.parse(text);
  }
  // Intenta leer el error del body, si no, usa el status
  const errorBody = await response.text();
  try {
    const errorJson = JSON.parse(errorBody);
    throw new Error(errorJson.detail || "Error en la solicitud a la API");
  } catch {
    throw new Error(errorBody || response.statusText);
  }
};

/**
 * Función auxiliar para obtener el token de autenticación
 * (Mejorada para no enviar Content-Type en GET/DELETE)
 */
const getAuthHeaders = (method: string = "GET") => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  
  // Content-Type solo es necesario para POST, PUT
  if (method === "POST" || method === "PUT") {
     headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- SERVICIOS DE CITAS (Antiguos) ---

/**
 * 1. Obtiene la lista de doctores desde TU API
 */
export const getDoctors = async () => {
  const response = await fetch(`${API_CITAS_URL}/doctors`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
};

/**
 * 2. Obtiene los horarios disponibles para un doctor en una fecha específica
 */
export const getAvailableSlots = async (doctorId: number | string, date: string) => {
  const response = await fetch(
    `${API_CITAS_URL}/doctors/${doctorId}/available-slots?appointment_date=${date}`,
    {
      method: 'GET',
      headers: getAuthHeaders("GET"),
    }
  );
  return handleResponse(response);
};

/**
 * 3. Crea una nueva cita
 */
export const createAppointment = async (appointmentData: {
  patient_id: number;
  doctor_id: number;
  appointment_datetime: string; // Formato ISO: "2023-10-27T10:00:00"
  reason: string;
}) => {
  const response = await fetch(`${API_CITAS_URL}/appointments`, {
    method: 'POST',
    headers: getAuthHeaders("POST"),
    body: JSON.stringify(appointmentData),
  });
  return handleResponse(response);
};

// --- SERVICIOS DE CITAS (Nuevos para Paciente) ---

/**
 * Obtiene las citas pendientes de un paciente
 */
export const getPatientAppointments = async (patientId: number) => {
  const response = await fetch(`${API_CITAS_URL}/patient/appointments/${patientId}?status=PENDING`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
};



/**
 * Cancela (actualiza a CANCELLED) una cita de paciente
 */
export const cancelPatientAppointment = async (appointmentId: number) => {
  // Nota: Usamos DELETE, pero tu API (correctamente) lo convierte en un UPDATE a 'CANCELLED'
  const response = await fetch(`${API_CITAS_URL}/patient/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders("DELETE"),
  });
  return handleResponse(response);
};


// --- SERVICIOS DE CITAS (Nuevos para Doctor) ---

/**
 * Obtiene las citas de un doctor por estado
 */
export const getDoctorAppointments = async (doctorId: number, status: string = "PENDING") => {
   const response = await fetch(`${API_CITAS_URL}/doctor/appointments/${doctorId}?status=${status}`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
}

/**
 * Permite a un doctor actualizar el estado de una cita
 */
export const updateDoctorAppointment = async (
  appointmentId: number, 
  status: "COMPLETED" | "CANCELLED"
) => {
  const response = await fetch(`${API_CITAS_URL}/doctor/appointments/${appointmentId}`, {
    method: 'PUT',
    headers: getAuthHeaders("PUT"),
    body: JSON.stringify({ status: status }),
  });
  return handleResponse(response);
}


// --- SERVICIO DE CITAS (Nuevo para Admin) ---

/**
 * Obtiene todas las citas pendientes del sistema
 */
export const getAllPendingAppointments = async () => {
   const response = await fetch(`${API_CITAS_URL}/admin/appointments?status=PENDING`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
}