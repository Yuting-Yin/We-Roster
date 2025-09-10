package com.weroster.controller;

import com.weroster.Dto.LeaveRequestDto;
import com.weroster.service.LeaveRequestService;
import com.weroster.Dto.ShiftSwapDto;
import com.weroster.service.ShiftSwapService;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class LeaveAndSwapController {
    private final ShiftSwapService swapService;

    private final LeaveRequestService leaveService;

    public LeaveAndSwapController(LeaveRequestService leaveService, ShiftSwapService swapService) {
        this.leaveService = leaveService;
        this.swapService = swapService;
    }

    // GET /shift-swaps
    @GetMapping("/shift-swaps")
    @PreAuthorize("isAuthenticated()")
    public List<ShiftSwapDto> listShiftSwaps() {
        return swapService.list();
    }

    // GET /leave-requests
    @GetMapping("/leave-requests")
    @PreAuthorize("isAuthenticated()")
    public List<LeaveRequestDto> listLeaveRequests() {
        return leaveService.list();
    }
}
