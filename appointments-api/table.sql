-- Script de inicializacion para la base CRUDG en Docker
CREATE DATABASE IF NOT EXISTS CRUDG;
USE CRUDG;

-- Tablas base usadas por el backend Java
CREATE TABLE IF NOT EXISTS tbl_patient (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email_address VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255),
    password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tbl_doctor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email_address VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    phone_number VARCHAR(255),
    specialty VARCHAR(255)
);

-- Tabla de citas consumida por appointments-api
CREATE TABLE IF NOT EXISTS tbl_appointment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_datetime DATETIME NOT NULL,
    reason VARCHAR(500),
    status VARCHAR(50) DEFAULT 'PENDING',
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES tbl_patient(id),
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES tbl_doctor(id),
    UNIQUE KEY uk_doctor_time (doctor_id, appointment_datetime)
);
