package com.example.CRUDG.service;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.CRUDG.entity.Patient;
import com.example.CRUDG.repository.PatientRepository;



@Service


public class PatientService {
    @Autowired
    PatientRepository patientRepository;

    @Autowired
    private PasswordService passwordService;


    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Patient saveOrUpdate(Patient patient) {
        // Hash the password before saving or updating
        patient.setPassword(passwordService.hashPassword(patient.getPassword()));
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Long id, Patient updatedPatient) {
        return patientRepository.findById(id).map(patient -> {
            patient.setName(updatedPatient.getName());
            patient.setEmailAddress(updatedPatient.getEmailAddress());
            // Hash the password before updating
            if (updatedPatient.getPassword() != null && !updatedPatient.getPassword().isBlank()) {
                patient.setPassword(passwordService.hashPassword(updatedPatient.getPassword()));
            }
            return patientRepository.save(patient);
        }).orElseGet(() -> {
            // If patient not found, save as new
            updatedPatient.setId(id);
            // Hash the password before saving
            //updatedPatient.setPassword(passwordService.hashPassword(updatedPatient.getPassword()));
            if (updatedPatient.getPassword() != null && !updatedPatient.getPassword().isBlank()) {
                updatedPatient.setPassword(passwordService.hashPassword(updatedPatient.getPassword()));
            }

            return patientRepository.save(updatedPatient);
        });
    }


    public void delete(Long id) {
        patientRepository.deleteById(id);
    }

    public Optional<Patient> findByEmail(String email) {
    return patientRepository.findByEmailAddress(email);
}


    
}
