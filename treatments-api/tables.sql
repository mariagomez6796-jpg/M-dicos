-- Primero, limpiamos por si quedó basura del intento anterior
DROP TABLE IF EXISTS `tbl_treatment_medicine`;
DROP TABLE IF EXISTS `tbl_treatment`;

-- Tabla para la Cabecera de la Receta (El Tratamiento)
-- CORRECCIÓN: Usamos BIGINT en lugar de INT para coincidir con Java
CREATE TABLE `tbl_treatment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `appointment_id` BIGINT NOT NULL,
  `patient_id` BIGINT NOT NULL,
  `doctor_id` BIGINT NOT NULL,
  `diagnosis` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_appointment` (`appointment_id`),
  -- Foreign Keys
  FOREIGN KEY (`appointment_id`) REFERENCES `tbl_appointment`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `tbl_patient`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `tbl_doctor`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla para los Medicamentos
CREATE TABLE `tbl_treatment_medicine` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `treatment_id` BIGINT NOT NULL,
  `medicine_name` VARCHAR(255) NOT NULL,
  `frequency` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`treatment_id`) REFERENCES `tbl_treatment`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;