package main.com.weroster.controller;

import main.com.weroster.Dto.TeamAboutDto;
import main.com.weroster.Dto.TeamScheduleDto;
import main.com.weroster.service.MyTeamService;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class MyTeamDetailsController {

    private final MyTeamService myTeamService;
    public MyTeamDetailsController(MyTeamService s) { this.myTeamService = s; }

    @GetMapping("/my-team/{id}/about")
    public TeamAboutDto about(@PathVariable("id") Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String callerEmail = auth.getName();
        return myTeamService.about(callerEmail, id);
    }

    @GetMapping("/my-team/{id}/schedule")
    public TeamScheduleDto schedule(
            @PathVariable("id") Long id,
            @RequestParam(required = false) String from, // YYYY-MM-DD
            @RequestParam(required = false) String to    // YYYY-MM-DD
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String callerEmail = auth.getName();
        LocalDate fromDate = (from == null || from.isBlank()) ? null : LocalDate.parse(from);
        LocalDate toDate   = (to   == null || to.isBlank())   ? null : LocalDate.parse(to);
        return myTeamService.schedule(callerEmail, id, fromDate, toDate);
    }
}
