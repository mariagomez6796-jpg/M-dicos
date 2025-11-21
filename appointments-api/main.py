import mysql.connector
from mysql.connector import errorcode
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date, datetime, time, timedelta
import os

app = FastAPI()


origins = [
    "*",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

def conectar_db():
    try:
        db = mysql.connector.connect(
            # Lee las variables de entorno de Docker
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASS", "root"),
            database=os.getenv("DB_NAME", "CRUDG")
        )
        return db
    except mysql.connector.Error as err:
        print(f"Error al conectar a la DB: {err}")
        return None
    
#Funcion que permitira validar los datos que le llegaran a la API
class AppointmentRequest(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_datetime: datetime
    reason: str | None = None



# Modelo para ACTUALIZAR estado (Doctor)
class DoctorAppointmentUpdate(BaseModel):
    status: str # Ej: "COMPLETED", "CANCELLED"



#Primer endpoint (Obtener doctores)
@app.get("/doctors")
def get_doctors():
    db = conectar_db()
    if not db:
        raise HTTPException(status_code=500, detail="Error de conexion a la base de datos")

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id, name, specialty FROM tbl_doctor")
    doctors = cursor.fetchall()
    db.close()
    return doctors


#2do endpoint (Obtener horarios disponibles de un doctor)
@app.get("/doctors/{doctor_id}/available-slots")
def get_available_slots(doctor_id: int, appointment_date: date = Query(...)):

    slots = []
    current_time = time(9, 0)
    end_time = time(17, 0)

    while current_time < end_time: 
        slots.append(current_time.strftime("%H:%M:%S"))
        current_time = (datetime.combine(date.today(), current_time) + timedelta(hours=1)).time()


    db = conectar_db()
    if not db:
        raise HTTPException(status_code=500, detail="Error de conexion a la base de datos")   

    cursor = db.cursor()
    query = """
        SELECT TIME(appointment_datetime)
        FROM tbl_appointment
        WHERE doctor_id = %s AND DATE(appointment_datetime) = %s AND status = 'PENDING'
    """
    cursor.execute(query, (doctor_id, appointment_date))

    ocupados = {str(row[0]) for row in cursor.fetchall()}
    db.close()

    disponibles = [slot for slot in slots if slot not in ocupados]

    return {"doctor_id": doctor_id, "date": appointment_date, "available_slots": disponibles}


# tercer endpoint: Crear una nueva cita

@app.post("/appointments")
def create_appointment(cita: AppointmentRequest):
    db = conectar_db()
    if not db:
        raise HTTPException(status_code=500, detail="Error de conexion a la base de datos")
    
    cursor = db.cursor()
    query = """
    INSERT INTO tbl_appointment 
    (patient_id, doctor_id, appointment_datetime, reason, status)
    VALUES (%s, %s, %s, %s, 'PENDING')
    """

    try:
        cursor.execute(query, (
            cita.patient_id,
            cita.doctor_id,
            cita.appointment_datetime,
            cita.reason
        ))
        db.commit() #Pa guardar los cambios

        return {
            "message": "Cita creada exitosamente",
            "appointment_id": cursor.lastrowid
        }
    except mysql.connector.Error as err:
        db.rollback()
        if err.errno == errorcode.ER_DUP_ENTRY:
            #Este error se mostrara cuando se quiera colocar un horario, en donde ya haya una cita
            raise HTTPException(status_code=409, detail="Conflicto: El doctor ya tiene una cita en ese horario.")
        else:
            raise HTTPException(status_code=500, detail=f"Error de base de datos: {err.msg}")
    finally:
        db.close()


    #Endpoint para poder ver las citas que tenga disponible el paciente

@app.get("/patient/appointments/{patient_id}")
def get_patient_appointments(patient_id: int, status: str = Query("PENDING")):
    "Se obtendras todas las citas de un paciente que esten pendientes"

    db = conectar_db()
    if not db:
        raise HTTPException(status_code=500, detail="Error de conexion a la base de datos")
    
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT 
            a.id, a.patient_id, a.doctor_id, a.appointment_datetime, a.reason, a.status,
            d.name AS doctor_name, d.specialty AS doctor_specialty
        FROM tbl_appointment a
        JOIN tbl_doctor d ON a.doctor_id = d.id
        WHERE a.patient_id = %s AND a.status = %s
    """
    cursor.execute(query, (patient_id, status))
    appointments = cursor.fetchall()
    db.close()
    return appointments



@app.delete("/patient/appointments/{appointment_id}")
def cancel_patient_appointment(appointment_id: int):
    #Permite a los pacientes poder cancelar una cita. En este caso, la cita pasa a estar en status 'CANCELLED'


    db = conectar_db()
    if not db:
        raise HTTPException(status_code=500, detail="Error de conexion a la base de datos")

    cursor = db.cursor()
    query = "UPDATE tbl_appointment SET status = 'CANCELLED' WHERE id = %s"

    
    try:
        cursor.execute(query, (appointment_id,))
        db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cita no encontrada.")
        return {"message": "Cita cancelada exitosamente"}
    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {err.msg}")
    finally:
        db.close()


# --- Endpoint que permite ver las citas que tenga disponible ---

@app.get("/doctor/appointments/{doctor_id}")
def get_doctor_appointments(doctor_id: int, status: str = Query("PENDING")):
    
   # Obtiene las citas de UN doctor, filtradas por estado (default: PENDING).
    
    db = conectar_db()
    if not db:
        raise HTTPException(status_code=500, detail="Error de conexion a la base de datos")
    
    cursor = db.cursor(dictionary=True)
    # Unimos con la tabla de pacientes para obtener el nombre del paciente
    query = """
        SELECT 
            a.id, a.patient_id, a.doctor_id, a.appointment_datetime, a.reason, a.status,
            p.name AS patient_name 
        FROM tbl_appointment a
        JOIN tbl_patient p ON a.patient_id = p.id
        WHERE a.doctor_id = %s AND a.status = %s
    """
    cursor.execute(query, (doctor_id, status))
    appointments = cursor.fetchall()
    db.close()
    return appointments

  
@app.put("/doctor/appointments/{appointment_id}")
def update_doctor_appointment(appointment_id: int, update_data: DoctorAppointmentUpdate):
    """
    Permite a un doctor cambiar el ESTADO (ej: a COMPLETED o CANCELLED)
    """
    db = conectar_db()
    if not db:
        raise HTTPException(status_code=500, detail="Error de conexion a la base de datos")

    cursor = db.cursor()

    query = "UPDATE tbl_appointment SET status = %s WHERE id = %s"
    params = (update_data.status, appointment_id)

    try:
        cursor.execute(query, params)
        db.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cita no encontrada.")
        return {"message": "Estado de la cita actualizado exitosamente"}
    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error de base de datos: {err.msg}")
    finally:
        db.close()

# --- NUEVO ENDPOINT (ADMIN) ---

@app.get("/admin/appointments")
def get_all_pending_appointments(status: str = Query("PENDING")):
    """
    Obtiene TODAS las citas del sistema filtradas por estado (default: PENDING).
    """
    db = conectar_db()
    if not db:
        raise HTTPException(status_code=500, detail="Error de conexion a la base de datos")
    
    cursor = db.cursor(dictionary=True)
    query = """
        SELECT 
            a.id, a.patient_id, a.doctor_id, a.appointment_datetime, a.reason, a.status,
            p.name AS patient_name,
            d.name AS doctor_name,
            d.specialty AS doctor_specialty  -- ¡¡ESTA ES LA LÍNEA QUE FALTABA!!
        FROM tbl_appointment a
        JOIN tbl_patient p ON a.patient_id = p.id
        JOIN tbl_doctor d ON a.doctor_id = d.id
        WHERE a.status = %s
    """
    cursor.execute(query, (status,))
    appointments = cursor.fetchall()
    db.close()
    return appointments
        
         