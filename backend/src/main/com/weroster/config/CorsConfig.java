// Java 8 / Boot 2.4 OK
package main.com.weroster.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(Arrays.asList("*")); // wildcard OK only when credentials=false
    c.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS"));
    c.setAllowedHeaders(Arrays.asList("*"));
    c.setAllowCredentials(false); // <— important with "*"
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return s;
  }
}
