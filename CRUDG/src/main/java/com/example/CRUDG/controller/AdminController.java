package com.example.CRUDG.controller;

import java.util.Optional;
import org.springframework.web.bind.annotation.RestController;
import com.example.CRUDG.service.AdminService;
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
import com.example.CRUDG.entity.Admin;




@RestController
@RequestMapping(path ="api/v1/admin")
@CrossOrigin(origins = "http://localhost:3000")




public class AdminController {
     @Autowired

    private AdminService adminService;

    
    @GetMapping
    public List<Admin> getAll() {
        return adminService.getAllAdmins();
        // Implementation for retrieving all doctors
    }

    @GetMapping("/{adminId}")
    public Optional <Admin> getBId(@PathVariable("adminId") Long adminId) {
        return adminService.getAdminById(adminId);
        // Implementation for retrieving all doctors
    }


    @PostMapping
    public void saveUpdate(@RequestBody Admin admin) {
         adminService.saveOrUpdate(admin);
        // Implementation for retrieving all doctors
    }

    @PutMapping("/{adminId}")
public Admin updateAdmin(@PathVariable("adminId") Long admiId, @RequestBody Admin admin) {
    // Use the service update method which performs partial update logic
    return adminService.updateAdmin(admiId, admin);
}



    @DeleteMapping("/{adminId}")
    public void saveUpdate(@PathVariable("adminId") Long adminId) {
        adminService.delete(adminId);
        // Implementation for retrieving all doctors
    }





    
}
