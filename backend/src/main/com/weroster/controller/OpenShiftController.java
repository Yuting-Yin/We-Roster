// src/main/java/com/weroster/controller/OpenShiftController.java
package main.com.weroster.controller;

import main.com.weroster.Dto.OpenShiftCompareResult;
import main.com.weroster.Dto.OpenShiftDto;
import main.com.weroster.service.OpenShiftService;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// src/main/java/main/com/weroster/controller/OpenShiftController.java
@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class OpenShiftController {

    private final OpenShiftService openShiftService;
    public OpenShiftController(OpenShiftService s) { this.openShiftService = s; }

    // ⬇️ was @GetMapping("/open-shifts")
    @GetMapping("/open-shifts/filter")
    public List<OpenShiftDto> filter(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String day,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String roleCode,
            @RequestParam(required = false) boolean urgentOnly,
            @RequestParam(required = false) Integer minExtraPay,
            @RequestParam(required = false) boolean mineOnly,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        return openShiftService.list(from, to, day, deptId, locationId, roleCode,
                urgentOnly, minExtraPay, mineOnly, limit, offset);
    }

    @GetMapping("/open-shifts/compare")
    public OpenShiftCompareResult compare(
            @RequestParam String aFrom, @RequestParam String aTo,
            @RequestParam String bFrom, @RequestParam String bTo,
            @RequestParam(required = false) Long deptId
    ) {
        return openShiftService.compare(aFrom, aTo, bFrom, bTo, deptId);
    }
}
