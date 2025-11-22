import mysql.connector
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def conectar_db():
    try:
        return mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASS", "root"),
            database=os.getenv("DB_NAME", "CRUDG")
        )
    except mysql.connector.Error as err:
        print(f"Error DB: {err}")
        return None
    
# --- Modelos ---
class MedicineItem(BaseModel):
    name: str
    frequency: str
    duration: str

class TreatmentCreate(BaseModel):
    appointment_id: int
    diagnosis: str
    medicines: List[MedicineItem]

# --- Endpoints ---

@app.post("/treatments")
def create_treatment(treatment: TreatmentCreate):
    db = conectar_db()
    if not db: raise HTTPException(status_code=500, detail="Error en la DB")
    cursor = db.cursor(dictionary=True)

    try:
        # 1. Buscamos la cita para obtener los IDs del paciente y doctor
        cursor.execute("SELECT patient_id, doctor_id, status FROM tbl_appointment WHERE id = %s", (treatment.appointment_id,))
        cita = cursor.fetchone()

        if not cita:
            raise HTTPException(status_code=404, detail="Cita no encontrada")
        
        if cita['status'] != 'COMPLETED':
            raise HTTPException(status_code=400, detail="Solo se pueden crear recetas cuando la cita haya sido completada.")
        
        # 2. Extraemos los IDs detectados
        patient_id_real = cita['patient_id']
        doctor_id_real = cita['doctor_id']

        # 3. Insertamos el Tratamiento (Cabecera)
        query_treatment = """
            INSERT INTO tbl_treatment (appointment_id, patient_id, doctor_id, diagnosis)
            VALUES (%s, %s, %s, %s)
        """
        
        cursor.execute(query_treatment, (
            treatment.appointment_id, 
            patient_id_real,
            doctor_id_real,
            treatment.diagnosis
        ))
        treatment_id = cursor.lastrowid

        # 4. Insertamos las Medicinas
        query_meds = """
            INSERT INTO tbl_treatment_medicine (treatment_id, medicine_name, frequency, duration)
            VALUES (%s, %s, %s, %s)
        """
        meds_data = [(treatment_id, m.name, m.frequency, m.duration) for m in treatment.medicines]

        if meds_data:
            cursor.executemany(query_meds, meds_data)

        db.commit()
        return {"message": "Receta creada exitosamente", "id": treatment_id}
    
    except mysql.connector.Error as err:
        db.rollback()
        if err.errno == 1062:
             raise HTTPException(status_code=409, detail="Ya existe una receta para esta cita.")
        raise HTTPException(status_code=500, detail=f"Error SQL: {err.msg}")
    finally:
        db.close()

@app.get("/patient/treatments/{patient_id}")
def get_patient_treatments(patient_id: int):
    db = conectar_db()
    if not db: raise HTTPException(status_code=500, detail="Error DB")
    cursor = db.cursor(dictionary=True)
    
    query = """
        SELECT t.*, d.name as doctor_name, d.specialty 
        FROM tbl_treatment t
        JOIN tbl_doctor d ON t.doctor_id = d.id
        WHERE t.patient_id = %s
        ORDER BY t.created_at DESC
    """
    cursor.execute(query, (patient_id,))
    treatments = cursor.fetchall()
    
    for t in treatments:
        cursor.execute("SELECT * FROM tbl_treatment_medicine WHERE treatment_id = %s", (t['id'],))
        t['medicines'] = cursor.fetchall()
        
    db.close()
    return treatments

@app.get("/treatment/by-appointment/{appointment_id}")
def get_treatment_by_appointment(appointment_id: int):
    db = conectar_db()
    if not db: raise HTTPException(status_code=500, detail="Error DB")
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM tbl_treatment WHERE appointment_id = %s", (appointment_id,))
    treatment = cursor.fetchone()
    
    if not treatment:
        return None 

    cursor.execute("SELECT * FROM tbl_treatment_medicine WHERE treatment_id = %s", (treatment['id'],))
    treatment['medicines'] = cursor.fetchall()
    
    db.close()
    return treatment

@app.put("/treatments/{treatment_id}")
def update_treatment(treatment_id: int, treatment: TreatmentCreate):
    db = conectar_db()
    if not db: raise HTTPException(status_code=500, detail="Error DB")
    cursor = db.cursor()

    try:
        cursor.execute("UPDATE tbl_treatment SET diagnosis = %s WHERE id = %s", (treatment.diagnosis, treatment_id))
        cursor.execute("DELETE FROM tbl_treatment_medicine WHERE treatment_id = %s", (treatment_id,))
        
        query_meds = """
            INSERT INTO tbl_treatment_medicine (treatment_id, medicine_name, frequency, duration)
            VALUES (%s, %s, %s, %s)
        """
        meds_data = [(treatment_id, m.name, m.frequency, m.duration) for m in treatment.medicines]
        
        if meds_data:
            cursor.executemany(query_meds, meds_data)
            
        db.commit()
        return {"message": "Receta actualizada exitosamente"}

    except mysql.connector.Error as err:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error SQL: {err.msg}")
    finally:
        db.close()

# --- ¡¡NUEVO ENDPOINT!! ---
# Obtener todos los tratamientos creados por un doctor
@app.get("/doctor/treatments/{doctor_id}")
def get_doctor_treatments(doctor_id: int):
    db = conectar_db()
    if not db: raise HTTPException(status_code=500, detail="Error DB")
    cursor = db.cursor(dictionary=True)
    
    # Hacemos JOIN con tbl_patient para mostrar el nombre del paciente
    query = """
        SELECT t.*, p.name as patient_name
        FROM tbl_treatment t
        JOIN tbl_patient p ON t.patient_id = p.id
        WHERE t.doctor_id = %s
        ORDER BY t.created_at DESC
    """
    cursor.execute(query, (doctor_id,))
    treatments = cursor.fetchall()
    
    # Llenamos las medicinas
    for t in treatments:
        cursor.execute("SELECT * FROM tbl_treatment_medicine WHERE treatment_id = %s", (t['id'],))
        t['medicines'] = cursor.fetchall()
        
    db.close()
    return treatments



