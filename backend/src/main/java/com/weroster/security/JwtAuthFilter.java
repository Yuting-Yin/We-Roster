// src/main/java/com/weroster/security/JwtAuthFilter.java
package com.weroster.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    public JwtAuthFilter(JwtService jwt) { this.jwt = jwt; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwt.parseBody(token);
                String principal = claims.getSubject();
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList()));
            } catch (Exception ignored) { }
        }
        chain.doFilter(request, response);
    }
}
