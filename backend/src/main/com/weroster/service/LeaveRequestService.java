// src/main/java/com/weroster/leave/LeaveRequestService.java
package main.com.weroster.service;

import main.com.weroster.Dto.LeaveRequestDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class LeaveRequestService {
    private final JdbcTemplate jdbc;

    public LeaveRequestService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<LeaveRequestDto> list() {
        String sql = "SELECT id, start_time, end_time FROM leave_request ORDER BY id DESC";
        return jdbc.query(sql, (rs, i) -> new LeaveRequestDto(
                rs.getLong("id"),
                toInstant(rs.getTimestamp("start_time")),
                toInstant(rs.getTimestamp("end_time"))
        ));
    }

    private static Instant toInstant(Timestamp ts) {
        return ts == null ? null : ts.toInstant();
    }
}
