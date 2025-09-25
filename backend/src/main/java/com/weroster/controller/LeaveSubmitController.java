// src/main/com/weroster/controller/LeaveSubmitController.java
package com.weroster.controller;

import com.weroster.Dto.CreateLeaveRequestCommand;
import com.weroster.Dto.SubmissionResponse;
import com.weroster.service.LeaveSubmitService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/myroster")
public class LeaveSubmitController {
    private final LeaveSubmitService svc;

    public LeaveSubmitController(LeaveSubmitService svc) { this.svc = svc; }

    private String currentEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : null;
    }

    @PostMapping(
            value = "/shift/{shiftId}/leave-request/submit",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<SubmissionResponse> submit(
            @PathVariable Long shiftId,
            @RequestBody CreateLeaveRequestCommand cmd
    ) {

        cmd.shiftId = shiftId;
        return ResponseEntity.ok(svc.submit(currentEmail(), cmd));
    }
}
