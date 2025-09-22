package com.weroster.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.weroster.service.CalendarServiceV2;
import com.weroster.service.MyRosterService;
import com.weroster.Dto.*;
import com.weroster.Dto.CalendarDayDto;
import com.weroster.Dto.DayRosterDto;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value="/api/v1/myroster", produces=MediaType.APPLICATION_JSON_VALUE)
public class MyRosterController {
    private final MyRosterService myRoster;
    private final CalendarServiceV2 calendar;
    private final ObjectMapper om; // Spring Boot 会自动注入
    private final MyRosterService svc;

    public MyRosterController(MyRosterService myRoster, CalendarServiceV2 calendar, ObjectMapper om, MyRosterService svc) {
        this.myRoster = myRoster;
        this.calendar = calendar;
        this.om = om;
        this.svc = svc;
    }
    // 放在控制器类里（或文件顶部），仅用于响应序列化
    record DaySummary(String date, boolean assignedAM, boolean assignedPM, boolean isToday) {}

    /**
     * Not for ui
     * @param date
     * @return
     * @throws Exception
     */
    @GetMapping(value="/day", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> day(@RequestParam(required=false) String date) throws Exception {
        var d = (date == null || date.isBlank())
                ? java.time.LocalDate.now()
                : java.time.LocalDate.parse(date);
        DayRosterDto dto = myRoster.day(email(), uid(), d);
        String json = om.writeValueAsString(dto); // 手工转 JSON 字符串
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(json);
    }

    /**
     * For ui, backend for the timetable list on we roster home page
     * @param date
     * @return
     * @throws Exception
     */
    @GetMapping(value = "/dayview", produces=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> dayView(@RequestParam String date) throws Exception {
        var d = java.time.LocalDate.parse(date);
        DayViewDto dto = myRoster.dayView(email(), uid(), d);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(om.writeValueAsString(dto));
    }

    /**
     * Method for refresh button backend logic
     * @param weekStart
     * @param currentDate
     * @return
     * @throws Exception
     */
    @GetMapping("/refresh")
    public ResponseEntity<String> refresh(
            @RequestParam(required = false) String weekStart,
            @RequestParam(required = false) String currentDate
    ) throws Exception {

        LocalDate current = (currentDate == null || currentDate.isBlank())
                ? LocalDate.now()
                : LocalDate.parse(currentDate);

        // 周一为起点
        LocalDate weekStartDate = (weekStart == null || weekStart.isBlank())
                ? current.minusDays((current.getDayOfWeek().getValue() + 6) % 7)
                : LocalDate.parse(weekStart);
        LocalDate weekEndDate = weekStartDate.plusDays(6);

        // 1) 拉一个月的日历数据
        List<?> out = calendar.range(email(), uid(), weekStartDate, 1);

        // 2) 只拣当周 7 天，并“投影”为 Map（date/assignedAM/assignedPM/isToday）
        List<Map<String, Object>> days = new ArrayList<>(7);
        for (Object o : out) {
            if (o instanceof CalendarDayDto d) {
                LocalDate dd = LocalDate.parse(d.date());
                if (!dd.isBefore(weekStartDate) && !dd.isAfter(weekEndDate)) {
                    days.add(Map.of(
                            "date", d.date(),
                            "assignedAM", d.assignedAM(),
                            "assignedPM", d.assignedPM(),
                            "isToday", d.isToday()
                    ));
                }
            } else {
                // （可选兜底）如果你还有旧版 POJO，而不是 record，可用 getter 取值
                try {
                    Class<?> c = o.getClass();
                    String date = (String) c.getMethod("getDate").invoke(o);
                    boolean am  = (boolean) c.getMethod("isAssignedAM").invoke(o);
                    boolean pm  = (boolean) c.getMethod("isAssignedPM").invoke(o);
                    boolean today = (boolean) c.getMethod("isToday").invoke(o);
                    LocalDate dd = LocalDate.parse(date);
                    if (!dd.isBefore(weekStartDate) && !dd.isAfter(weekEndDate)) {
                        days.add(Map.of(
                                "date", date,
                                "assignedAM", am,
                                "assignedPM", pm,
                                "isToday", today
                        ));
                    }
                } catch (Exception ignore) {
                    // 静默忽略非预期类型
                }
            }
        }

        // 3) 当天 timeline（主界面列表）
        DayRosterDto timeline = myRoster.day(email(), uid(), current);

        // 4) 组装 JSON（手工序列化，彻底绕过 HttpMessageConverter 的历史问题）
        Map<String, Object> root = new LinkedHashMap<>();
        root.put("week", Map.of("start", weekStartDate.toString(), "end", weekEndDate.toString()));
        root.put("days", days);
        root.put("timeline", timeline);

        String json = om.writeValueAsString(root);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(json);
    }


    private String email() {
        var a = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return a != null ? a.getName() : null;
    }
    private Long uid() { return null; }
    @GetMapping(value = "/shift/{shiftId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ShiftDetailsDto shiftDetails(@PathVariable long shiftId) {
        return svc.shiftDetails(email(), uid(), shiftId);
    }
}
