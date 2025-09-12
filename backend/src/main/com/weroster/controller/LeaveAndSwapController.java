package main.com.weroster.controller;

import main.com.weroster.Dto.*;
import main.com.weroster.service.LeaveRequestService;
import main.com.weroster.service.OpenShiftService;
import main.com.weroster.service.ShiftSwapService;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class LeaveAndSwapController {
    private final OpenShiftService openShiftService;
    private final ShiftSwapService swapService;

    private final LeaveRequestService leaveService;

    public LeaveAndSwapController(LeaveRequestService leaveService, ShiftSwapService swapService, OpenShiftService openShiftService) {
        this.leaveService = leaveService;
        this.swapService = swapService;
        this.openShiftService = openShiftService;
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

    // GET /open-shifts (default view)
    //@GetMapping("/open-shifts")
    @PreAuthorize("isAuthenticated()")
    public List<OpenShiftDto> listOpenShifts(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        return openShiftService.list(Math.max(1, Math.min(100, limit)), Math.max(0, offset));
    }
    // Comment to be deleted
    //@GetMapping("/open-shifts/compare")
    @PreAuthorize("isAuthenticated()")
    public OpenShiftCompareResult compareOpenShifts(
            @RequestParam String fromA,
            @RequestParam String toA,
            @RequestParam String fromB,
            @RequestParam String toB,
            @RequestParam(required = false) Long deptId
    ) {
        String aFrom = String.valueOf(Instant.parse(fromA));
        String aTo = String.valueOf(Instant.parse(toA));
        String bFrom = String.valueOf(Instant.parse(fromB));
        java.time.Instant bTo = java.time.Instant.parse(toB);
        return openShiftService.compare(aFrom, aTo, bFrom, String.valueOf(bTo), deptId);

    }
}
