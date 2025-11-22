package com.example.CRUDG.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import com.example.CRUDG.security.JwtFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;






@Configuration
@EnableWebSecurity

public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;


    
   

    // 🔹 Permitir acceso libre a todos los endpoints
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            //.cors(cors -> {})
            .csrf(csrf -> csrf.disable())  // desactiva CSRF (útil para pruebas con Postman)
            .authorizeHttpRequests(auth -> auth
            // permite preflight requests
            //.requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
            //endpoinds publicos
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/patients/register").permitAll()
                //edpoinds protegisdos por rol
                .requestMatchers("/api/v1/admin/**", "/api/v1/admin").permitAll()//hasRole("Admin")
                .requestMatchers("/api/v1/doctor/**", "/api/v1/doctor").permitAll()//hasAnyRole("Admin")
                .requestMatchers("/api/v1/patient/**", "/api/v1/patient").permitAll()
                //.requestMatchers("/api/v1/patients/**").permitAll()//hasAnyRole("Admin","Doctor")
                .anyRequest().authenticated() // permite todo sin autenticación
            )


            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
            // Registramos el filtro JWT antes del filtro de autenticación por username/password
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class); 

            
    

        return http.build();
    }
    
    // Definimos un CorsConfigurationSource para que Spring Security permita los métodos que necesitamos
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    // 🔹 Bean para codificar contraseñas (esto ya lo tenías)
    @Bean
    public PasswordEncoder passwordEncoder() {
    return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }


}

