// src/main/com/weroster/controller/LeaveRequestController.java
package com.weroster.controller;

import com.weroster.Dto.CreateLeaveRequestCommand;
import com.weroster.Dto.LeaveRequestDto;
import com.weroster.service.LeaveRequestService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/myroster")
public class LeaveRequestController {
    private final LeaveRequestService svc;

    public LeaveRequestController(LeaveRequestService svc) {
        this.svc = svc;
    }

    private String email() {
        var a = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return a != null ? a.getName() : null;
    }
    private Long uid() { return null; } // 你要用 userId 的话，照你现有代码取

    /** 创建/更新 请假 */
    @PostMapping(value = "/leave-request", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LeaveRequestDto> create(@RequestBody CreateLeaveRequestCommand cmd) {
        var resp = svc.createOrUpdate(email(), uid(), cmd);
        return ResponseEntity.ok(resp);
    }

    /** 回显：我在某个班次的请假 */
    @GetMapping(value = "/shift/{shiftId}/leave-request", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> mine(@PathVariable long shiftId) {
        var resp = svc.getMine(email(), uid(), shiftId);
        return ResponseEntity.ok(resp == null ? new LeaveRequestDto() : resp);
    }
}
