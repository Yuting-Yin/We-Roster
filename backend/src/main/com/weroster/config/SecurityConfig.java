package main.com.weroster.config;

import main.com.weroster.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.*;

@EnableWebSecurity
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired private JwtAuthFilter jwtAuthFilter;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
                .cors().and()
                .authorizeRequests()
                .antMatchers(            "/api/v1/health",
                        "/api/v1/auth/login",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/webjars/**").permitAll().antMatchers(org.springframework.http.HttpMethod.GET,
                        "/api/v1/leave-requests","/api/v1/shift-swaps"
                    ).permitAll().antMatchers(HttpMethod.GET,
                        "/api/v1/leave-requests",
                        "/api/v1/shift-swaps",
                        "/api/v1/my-team",
                        "/api/v1/my-team/summary").authenticated().anyRequest().authenticated()
                .and().addFilterBefore(jwtAuthFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
    }
}