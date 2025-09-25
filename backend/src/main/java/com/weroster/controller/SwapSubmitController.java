// src/main/com/weroster/controller/SwapSubmitController.java
package com.weroster.controller;

import com.weroster.Dto.SubmissionResponse;
import com.weroster.Dto.SwapSubmitCommand;
import com.weroster.service.SwapSubmitService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/myroster")
public class SwapSubmitController {
    private final SwapSubmitService svc;
    public SwapSubmitController(SwapSubmitService svc) { this.svc = svc; }

    private String currentEmail(){
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    @PostMapping(
            value = "/shift/{shiftId}/swap/submit",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<SubmissionResponse> submit(
            @PathVariable Long shiftId,
            @RequestBody SwapSubmitCommand cmd
    ) {
        cmd.requesterShiftId = shiftId;
        return ResponseEntity.ok(svc.submit(currentEmail(), cmd));
    }
}
