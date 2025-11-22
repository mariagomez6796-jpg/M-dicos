package com.example.CRUDG.repository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.CRUDG.entity.Doctor;
import java.util.Optional;
@Repository

public interface  DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);

    
}
