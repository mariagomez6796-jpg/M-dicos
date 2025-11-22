package com.example.CRUDG.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name="tbl_patient")

public class Patient {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    private String name;

    @jakarta.persistence.Column(name = "email_address",unique = true, nullable=false)
    private String emailAddress;

    private String phone;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

}
