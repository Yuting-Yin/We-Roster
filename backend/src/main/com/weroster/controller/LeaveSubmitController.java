// src/main/com/weroster/controller/LeaveSubmitController.java
package main.com.weroster.controller;

import main.com.weroster.Dto.CreateLeaveRequestCommand;
import main.com.weroster.Dto.SubmissionResponse;
import main.com.weroster.service.LeaveSubmitService;
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
        return auth != null ? auth.getName() : null; // 你项目里 name=邮箱
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
        // 以路径为准，覆盖请求体
        cmd.shiftId = shiftId;
        return ResponseEntity.ok(svc.submit(currentEmail(), cmd));
    }
}
