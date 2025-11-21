--Agreguen esta madre a la base de datos del contenedor
CREATE TABLE tbl_appointment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    -- Almacenamos fecha Y hora en una sola columna
    appointment_datetime DATETIME NOT NULL, 
    
    reason VARCHAR(500),
    status VARCHAR(50) DEFAULT 'PENDING', -- (PENDING, CONFIRMED, CANCELLED)
    
    FOREIGN KEY (patient_id) REFERENCES tbl_patient(id),
    FOREIGN KEY (doctor_id) REFERENCES tbl_doctor(id),
    
    -- Creamos un índice único para evitar citas duplicadas
    -- Un doctor no puede tener dos citas a la misma hora
    UNIQUE KEY uk_doctor_time (doctor_id, appointment_datetime)
);

