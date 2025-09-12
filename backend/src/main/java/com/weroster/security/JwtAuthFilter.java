// src/main/java/com/weroster/security/JwtAuthFilter.java
package com.weroster.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    public JwtAuthFilter(JwtService jwt) { this.jwt = jwt; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Always log once so you know the filter is running
        System.out.println("[SEC] JwtAuthFilter hit path=" + request.getRequestURI());

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String token = header.substring(7);
            try {
                // MUST verify signature/exp/issuer; this should throw on bad tokens
                Claims claims = jwt.parseBody(token);

                String principal = claims.getSubject();
                Object rawRole = claims.get("role");       // ADMIN / STAFF / MANAGER
                String role = rawRole == null ? null : rawRole.toString();

                if (principal != null) {
                    List<SimpleGrantedAuthority> auths = (role == null)
                            ? Collections.emptyList()
                            : Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));

                    System.out.println("[SEC] SET AUTH principal=" + principal + " role=" + role + " auths=" + auths);

                    SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(principal, null, auths));
                }
            } catch (io.jsonwebtoken.JwtException e) {
                //Bad/expired/malformed token -> return 401 and STOP the chain
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"code\":\"UNAUTHORIZED\",\"message\":\"Invalid or expired token\"}");
                return; // <— IMPORTANT: do not continue*/
            }
        }

        chain.doFilter(request, response);
    }
}
