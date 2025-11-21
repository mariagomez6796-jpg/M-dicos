package com.example.CRUDG.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.CRUDG.entity.Admin;
import java.util.Optional;

@Repository

public interface  AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmail(String email);
    
}
