// src/main/java/com/weroster/security/JwtService.java
package com.weroster.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    @Value("${security.jwt.secret}") private String secret;
    @Value("${security.jwt.issuer}") private String issuer;
    @Value("${security.jwt.access-token-minutes}") private long accessMinutes;

    public String issueAccessToken(String subject, Map<String, Object> claims) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + accessMinutes * 60_000);
        return Jwts.builder()
                .setIssuer(issuer)
                .setSubject(subject)
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(SignatureAlgorithm.HS256, secret.getBytes(StandardCharsets.UTF_8))
                .compact();
    }

    public Claims parseBody(String jwt) {
        return Jwts.parser()
                .setSigningKey(secret.getBytes(StandardCharsets.UTF_8))
                .parseClaimsJws(jwt)
                .getBody();
    }
}
