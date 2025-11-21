package com.example.CRUDG.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.example.CRUDG.entity.Admin;
import com.example.CRUDG.repository.AdminRepository;

@Service

public class AdminService {

    @Autowired
    AdminRepository adminRepository;

    @Autowired
    private PasswordService passwordService;

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }

    public Admin saveOrUpdate(Admin admin) {
        // Hash the password before saving or updating
        admin.setPassword(passwordService.hashPassword(admin.getPassword()));
        return adminRepository.save(admin);
    }

    public Admin updateAdmin(Long id, Admin updatedAdmin) {
        return adminRepository.findById(id).map(admin -> {
            admin.setName(updatedAdmin.getName());
            admin.setEmail(updatedAdmin.getEmail());
            // Hash the password before updating, only when a new password was provided
            String newPassword = updatedAdmin.getPassword();
            if (newPassword != null && !newPassword.isBlank()) {
                admin.setPassword(passwordService.hashPassword(newPassword));
            }
            return adminRepository.save(admin);
        }).orElseGet(() -> {
            // If admin not found, save as new
            updatedAdmin.setId(id);
            // Hash the password before saving if provided
            String newPassword = updatedAdmin.getPassword();
            if (newPassword != null && !newPassword.isBlank()) {
                updatedAdmin.setPassword(passwordService.hashPassword(newPassword));
            }
            return adminRepository.save(updatedAdmin);
        });
    }
    
    public void delete(Long id) {
        adminRepository.deleteById(id);
    }

    public Optional<Admin> findByEmail(String email) {
    return adminRepository.findByEmail(email);
}


}
