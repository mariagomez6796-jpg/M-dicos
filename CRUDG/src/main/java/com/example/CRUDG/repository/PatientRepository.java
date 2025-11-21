package com.example.CRUDG.repository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.CRUDG.entity.Patient;
import java.util.Optional;


@Repository

public interface  PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmailAddress(String email);

    
}
