// src/main/com/weroster/controller/SwapShiftController.java
package com.weroster.controller;

import com.weroster.Dto.SwapShiftResponse;
import com.weroster.service.SwapShiftService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/myroster")
public class SwapShiftController {
    private final SwapShiftService svc;

    public SwapShiftController(SwapShiftService svc) {
        this.svc = svc;
    }

    private String currentEmail() {
        var a = SecurityContextHolder.getContext().getAuthentication();
        return a != null ? a.getName() : null; // 你项目里 email 就是 Principal name
    }

    /**
     * ShiftDetail 页面点击 “Swap Shift” 后调用
     * 返回：mine + search(total + items[])
     */
    @GetMapping(value = "/shift/{shiftId}/swap", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SwapShiftResponse> swapData(@PathVariable long shiftId) {
        var resp = svc.buildSwapData(shiftId, currentEmail());
        return ResponseEntity.ok(resp);
    }
}
