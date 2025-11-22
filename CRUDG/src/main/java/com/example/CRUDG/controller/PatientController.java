package com.example.CRUDG.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;


import com.example.CRUDG.service.PatientService;
import com.example.CRUDG.entity.Patient;



@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
@RestController
@RequestMapping(path ="api/v1/patient")


public class PatientController {
    @Autowired
     private PatientService patientService;

     @GetMapping
    public List<Patient> getAll() {
        return patientService.getAllPatients();
        
    }

    @GetMapping("/{patientId}")
    public Optional <Patient> getBId(@PathVariable("patientId") Long patientId) {
        return patientService.getPatientById(patientId);
        
    }


    @PostMapping
    public void saveUpdate(@RequestBody Patient patient) {
        patientService.saveOrUpdate(patient);


        
    }


    @PutMapping("/{patientId}")
public Patient updatePatient(@PathVariable("patientId") Long patientId, @RequestBody Patient patient) {
    //patient.setId(patientId);
    return patientService.updatePatient(patientId, patient);
}



    @DeleteMapping("/{patientId}")
    public void saveUpdate(@PathVariable("patientId") Long patientId) {
        patientService.delete(patientId);
       
    }
    
    
}
