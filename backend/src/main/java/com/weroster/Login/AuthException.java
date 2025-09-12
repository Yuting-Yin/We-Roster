// src/main/java/com/weroster/auth/AuthException.java
package com.weroster.Login;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class AuthException extends ResponseStatusException {
    public AuthException(String code) { super(HttpStatus.UNAUTHORIZED, code); }
}
