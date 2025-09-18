package main.com.weroster.controller;

import main.com.weroster.Dto.ShiftRequestSubmitCommand;
import main.com.weroster.Dto.SubmissionResponse;
import main.com.weroster.service.ShiftRequestSubmitService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/myroster")
public class ShiftRequestSubmitController {
    private final ShiftRequestSubmitService svc;
    public ShiftRequestSubmitController(ShiftRequestSubmitService svc) { this.svc = svc; }

    private String currentEmail() {
        var a = SecurityContextHolder.getContext().getAuthentication();
        return a != null ? a.getName() : null;
    }

    @PostMapping(
            value = "/shift/{shiftId}/request/submit",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<SubmissionResponse> submit(
            @PathVariable Long shiftId,
            @RequestBody(required = false) ShiftRequestSubmitCommand cmd
    ) {
        return ResponseEntity.ok(svc.submit(currentEmail(), shiftId, cmd));
    }
}
