package main.com.weroster.controller;

import main.com.weroster.Dto.TeamMemberDto;
import main.com.weroster.Dto.TeamSummaryDto;
import main.com.weroster.service.MyTeamService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping(path = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class MyTeamController {

    private final MyTeamService service;
    public MyTeamController(MyTeamService service) { this.service = service; }

    // GET /my-team?q=&deptId=&limit=&offset=
    @GetMapping("/my-team")
    public List<TeamMemberDto> myTeam(
            Principal principal,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long deptId,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        String email = principal.getName(); // from JwtAuthFilter -> subject=email
        return service.list(email, q, deptId, limit, offset);
    }

    // GET /my-team/summary?q=&deptId=
    @GetMapping("/my-team/summary")
    public TeamSummaryDto summary(
            Principal principal,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long deptId
    ) {
        return service.summary(principal.getName(), deptId, q);
    }
}
