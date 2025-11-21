package com.example.CRUDG.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service

public class PasswordService {
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Devuelve el hash de la contraseña. Si la contraseña ya parece un hash de BCrypt,
     * la devuelve tal cual (evita re-hasheo).
     */
    public String hashPassword(String plainPassword) {
        if (plainPassword == null) return null;
        // BCrypt hashes normalmente empiezan con $2a$ o $2b$ etc.
        if (plainPassword.startsWith("$2a$") || plainPassword.startsWith("$2b$") || plainPassword.startsWith("$2y$")) {
            return plainPassword;
        }
        return passwordEncoder.encode(plainPassword);
    }

    public boolean checkPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null) return false;
        return passwordEncoder.matches(plainPassword, hashedPassword);
    }
    
}
