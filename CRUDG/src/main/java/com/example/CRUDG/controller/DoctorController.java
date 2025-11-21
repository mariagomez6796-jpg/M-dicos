package com.example.CRUDG.controller;

import java.util.Optional;

import org.springframework.web.bind.annotation.RestController;

import com.example.CRUDG.service.DoctorService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;
import com.example.CRUDG.entity.Doctor;









@RestController
@RequestMapping(path ="api/v1/doctor")
@CrossOrigin(origins = "http://localhost:3000")


public class DoctorController {

    @Autowired

    private DoctorService doctorService;

    
    @GetMapping
    public List<Doctor> getAll() {
        return doctorService.getAllDoctors();
        // Implementation for retrieving all doctors
    }

    @GetMapping("/{doctorId}")
    public Optional <Doctor> getBId(@PathVariable("doctorId") Long doctorId) {
        return doctorService.getDoctorById(doctorId);
        // Implementation for retrieving all doctors
    }


    @PostMapping
    public void saveUpdate(@RequestBody Doctor doctor) {
        doctorService.saveOrUpdate(doctor);
        // Implementation for retrieving all doctors
    }

@PutMapping("/{doctorId}")
public Doctor updateDoctor(@PathVariable("doctorId") Long doctorId, @RequestBody Doctor doctor) {
    // Ensure the path id is used and delegate to service update method
     return doctorService.updateDoctor(doctorId, doctor);
}



    @DeleteMapping("/{doctorId}")
    public void saveUpdate(@PathVariable("doctorId") Long doctorId) {
        doctorService.delete(doctorId);
        // Implementation for retrieving all doctors
    }
    
}
