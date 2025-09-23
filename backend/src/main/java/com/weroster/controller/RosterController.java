package com.weroster.controller;

import com.weroster.service.CalendarServiceV2;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/roster")
public class RosterController {
    private final CalendarServiceV2 svc;
    public RosterController(CalendarServiceV2 svc) { this.svc = svc; }

    private String email() { Authentication a= SecurityContextHolder.getContext().getAuthentication(); return a!=null? a.getName(): null; }
    private Long uid()    { return null; /* plug in JWT uid if available */ }

}
