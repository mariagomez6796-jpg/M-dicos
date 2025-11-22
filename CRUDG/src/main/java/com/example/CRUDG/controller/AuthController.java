package com.example.CRUDG.controller;
import org.springframework.web.bind.annotation.RestController;

import com.example.CRUDG.entity.Doctor;
import com.example.CRUDG.entity.Patient;
import com.example.CRUDG.entity.Admin;
import com.example.CRUDG.service.AdminService;
import com.example.CRUDG.service.DoctorService;
import com.example.CRUDG.service.PasswordService;
import com.example.CRUDG.service.PatientService;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;
import java.util.Optional;
import com.example.CRUDG.security.JwtUtil;



@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000") 

public class AuthController {
     @Autowired private PatientService patientService;
    @Autowired private DoctorService doctorService;
    @Autowired private AdminService adminService;
    @Autowired private PasswordService passwordService;
    @Autowired private JwtUtil jwtUtil;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        // Buscar como paciente
         Optional<Patient> p = patientService.findByEmail(email);
    if (p.isPresent() && passwordService.checkPassword(password, p.get().getPassword())) {
        String token = jwtUtil.generateToken(p.get().getId(), email, "PATIENT");
        return ResponseEntity.ok(Map.of("token", token, "role", "PATIENT", "email", email, "id", p.get().getId()));
    }

        // Buscar como doctor
       Optional<Doctor> d = doctorService.findByEmail(email);
    if (d.isPresent() && passwordService.checkPassword(password, d.get().getPassword())) {
        String token = jwtUtil.generateToken(d.get().getId(), email, "DOCTOR");
        return ResponseEntity.ok(Map.of("token", token, "role", "DOCTOR", "email", email, "id", d.get().getId()));
    }

        // Buscar como admin
        Optional<Admin> a = adminService.findByEmail(email);
    if (a.isPresent() && passwordService.checkPassword(password, a.get().getPassword())) {
        String token = jwtUtil.generateToken(a.get().getId(),email, "ADMIN");
        return ResponseEntity.ok(Map.of("token", token, "role", "ADMIN", "email", email, "id", a.get().getId()));
    }

        // No encontrado
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuario no encontrado"));
    }
    
}
