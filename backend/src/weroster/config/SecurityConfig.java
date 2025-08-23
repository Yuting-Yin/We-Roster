package com.weroster.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf->csrf.disable());
    http.cors(Customizer.withDefaults());
    http.authorizeHttpRequests(auth->auth
      .requestMatchers("/api/v1/health-check","/api/v1/las/auth/login").permitAll()
      .anyRequest().authenticated()
    );
    return http.build();
  }
}