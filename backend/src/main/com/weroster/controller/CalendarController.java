package main.com.weroster.controller;

import main.com.weroster.Dto.CalendarDayDto;
import main.com.weroster.Dto.DayRosterItem;
import main.com.weroster.service.CalendarServiceV2;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/calendar")
/***
 * Class for expand calendar view
 */
public class CalendarController {
    private final CalendarServiceV2 svc;
    public CalendarController(@Qualifier("calendarServiceV2") CalendarServiceV2 svc) { this.svc = svc; }

    private String email() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        return a != null ? a.getName() : null;
    }
    private Long uid() { return null; } // plug in your JWT uid if you store it

    /**
     * Method to determine if there is shift at Am or Pm
     * @param start
     * @param months
     * @return
     */
    @GetMapping({"/range", "/range2"})
    public List<Map<String,Object>> range2(@RequestParam String start,
                                           @RequestParam(defaultValue="1") int months) {
        var out = svc.range(email(), uid(), LocalDate.parse(start), months);

        List<Map<String, Object>> list = new ArrayList<>();
        for (Object o : out) {
            if (o instanceof main.com.weroster.Dto.CalendarDayDto d) {
                list.add(Map.of(
                        "date", d.date(),
                        "assignedAM", d.assignedAM(),
                        "assignedPM", d.assignedPM(),
                        "isToday", d.isToday()
                ));
            } else if (o instanceof Map<?, ?> m) {
                // expose the raw keys so we can see what SQL returned
                Map<String, Object> copy = new LinkedHashMap<>();
                m.forEach((k, v) -> copy.put(String.valueOf(k), v));
                list.add(copy);
            } else {
                list.add(Map.of("runtimeType", o == null ? "null" : o.getClass().getName()));
            }
        }
        return list;
    }


}
