package main.com.weroster.service;

import main.com.weroster.Dto.CalendarDayDto;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@Primary
public class CalendarServiceV2 {
    private final JdbcTemplate jdbc;
    public CalendarServiceV2(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    // map current user to staff_id (user_staff first, fallback by email)
    private Long resolveStaffId(String email, Long uid) {
        if (uid != null) {
            Long sid = jdbc.query(
                    "SELECT staff_id FROM user_staff WHERE user_id=? LIMIT 1",
                    ps -> ps.setLong(1, uid),
                    rs -> rs.next() ? rs.getLong(1) : null);
            if (sid != null) return sid;
        }
        if (email != null) {
            return jdbc.query(
                    "SELECT id FROM staff WHERE LOWER(email)=LOWER(?) LIMIT 1",
                    ps -> ps.setString(1, email),
                    rs -> rs.next() ? rs.getLong(1) : null);
        }
        return null;
    }

    public List<CalendarDayDto> range(String email, Long uid, LocalDate start, int months) {
        Long staffId = resolveStaffId(email, uid);
        LocalDate end = start.plusMonths(months).minusDays(1);

        // 先铺满骨架，保证四个字段一定返回
        List<CalendarDayDto> days = new ArrayList<>();
        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            days.add(new CalendarDayDto(d.toString(), false, false, d.equals(LocalDate.now())));
        }
        if (staffId == null) return days;

        // 直接取 LocalDateTime，不做 UNIX_TIMESTAMP/UTC
        record Span(LocalDateTime start, LocalDateTime end) {}
        List<Span> spans = jdbc.query(
                """
                SELECT s.start_ts, s.end_ts
                FROM shift s
                JOIN shift_assignment sa ON sa.shift_id = s.id
                WHERE sa.staff_id = ?
                  AND s.end_ts   > ?
                  AND s.start_ts < ?
                """,
                (rs,i) -> new Span(
                        rs.getTimestamp(1).toLocalDateTime(),
                        rs.getTimestamp(2).toLocalDateTime()
                ),
                staffId,
                start.atStartOfDay(),              // JDBC 4.2 会把 LocalDateTime 正确传入
                end.plusDays(1).atStartOfDay()
        );

        // 用“时间段重叠”判定 AM/PM（AM=08:00–12:59；PM=13:00–23:59）
        for (int i = 0; i < days.size(); i++) {
            CalendarDayDto cur = days.get(i);
            LocalDate d = LocalDate.parse(cur.date());

            LocalDateTime amStart = d.atTime(8, 0);
            LocalDateTime amEnd   = d.atTime(13, 0);
            LocalDateTime pmStart = d.atTime(13, 0);
            LocalDateTime pmEnd   = d.plusDays(1).atStartOfDay();

            boolean am = false, pm = false;
            for (Span sp : spans) {
                if (sp.start().isBefore(amEnd) && sp.end().isAfter(amStart)) am = true;
                if (sp.start().isBefore(pmEnd) && sp.end().isAfter(pmStart)) pm = true;
                if (am && pm) break;
            }

            days.set(i, new CalendarDayDto(cur.date(), am, pm, cur.isToday()));
        }
        return days;
    }

}
