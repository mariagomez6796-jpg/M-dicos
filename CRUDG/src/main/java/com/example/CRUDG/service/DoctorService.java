package com.example.CRUDG.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.CRUDG.entity.Doctor;
import com.example.CRUDG.repository.DoctorRepository;



@Service

public class DoctorService {
    @Autowired
    DoctorRepository doctorRepository;

    @Autowired
    private PasswordService passwordService;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Doctor saveOrUpdate(Doctor doctor) {
        // Hash the password before saving or updating
        doctor.setPassword(passwordService.hashPassword(doctor.getPassword()));
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setName(updatedDoctor.getName());
            doctor.setEmail(updatedDoctor.getEmail());
            // Hash the password before updating, only when a new password was provided
            String newPassword = updatedDoctor.getPassword();
            if (newPassword != null && !newPassword.isBlank()) {
                doctor.setPassword(passwordService.hashPassword(newPassword));
            }


            
            return doctorRepository.save(doctor);
        }).orElseGet(() -> {
            // If doctor not found, save as new
            updatedDoctor.setId(id);
            // Hash the password before saving if provided
            String newPassword = updatedDoctor.getPassword();
            if (newPassword != null && !newPassword.isBlank()) {
                updatedDoctor.setPassword(passwordService.hashPassword(newPassword));
            }
            return doctorRepository.save(updatedDoctor);
        });
    }

    public void delete(Long id) {
        doctorRepository.deleteById(id);
    }

    public Optional<Doctor> findByEmail(String email) {
    return doctorRepository.findByEmail(email);
}


    
}
