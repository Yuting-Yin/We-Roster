// src/main/com/weroster/service/LeaveRequestService.java
package main.com.weroster.service;

import main.com.weroster.Dto.CreateLeaveRequestCommand;
import main.com.weroster.Dto.LeaveRequestDto;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class LeaveRequestService {
    private final JdbcTemplate jdbc;

    public LeaveRequestService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // 复用你们的“用户->职员”解析方式（和 MyRosterService 私有方法同逻辑）
    private Long resolveStaffId(String email, Long uid) {
        if (uid != null) {
            Long sid = jdbc.query(
                    "SELECT staff_id FROM user_staff WHERE user_id=? LIMIT 1",
                    ps -> ps.setLong(1, uid),
                    rs -> rs.next() ? rs.getLong(1) : null
            );
            if (sid != null) return sid;
        }
        if (email != null) {
            return jdbc.query(
                    "SELECT id FROM staff WHERE LOWER(email)=LOWER(?) LIMIT 1",
                    ps -> ps.setString(1, email),
                    rs -> rs.next() ? rs.getLong(1) : null
            );
        }
        return null;
    }

    // 新建或覆盖当前用户在某班次的请假
    public LeaveRequestDto createOrUpdate(String email, Long uid, CreateLeaveRequestCommand cmd) {
        Long staffId = resolveStaffId(email, uid);
        if (staffId == null) throw new IllegalArgumentException("No staff found for current user");

        LocalDate d = LocalDate.parse(cmd.date);
        LocalDateTime st = cmd.allDay ? d.atStartOfDay()
                : LocalDateTime.of(d, LocalTime.parse(cmd.startTime));
        LocalDateTime et = cmd.allDay ? d.atTime(23, 59)
                : LocalDateTime.of(d, LocalTime.parse(cmd.endTime));

        // 先查是否已存在记录（同一员工+同一班次）
        Long existingId = jdbc.query(
                "SELECT id FROM leave_request WHERE staff_id=? AND shift_id=? LIMIT 1",
                ps -> { ps.setLong(1, staffId); ps.setLong(2, cmd.shiftId); },
                rs -> rs.next() ? rs.getLong(1) : null
        );

        if (existingId == null) {
            jdbc.update(
                    "INSERT INTO leave_request(shift_id, staff_id, leave_type, all_day, start_time, end_time) " +
                            "VALUES(?, ?, ?, ?, ?, ?)",
                    ps -> {
                        ps.setLong(1, cmd.shiftId);
                        ps.setLong(2, staffId);
                        ps.setString(3, cmd.leaveType);
                        ps.setBoolean(4, cmd.allDay);
                        ps.setTimestamp(5, Timestamp.valueOf(st));
                        ps.setTimestamp(6, Timestamp.valueOf(et));
                    }
            );
        } else {
            jdbc.update(
                    "UPDATE leave_request " +
                            "SET leave_type=?, all_day=?, start_time=?, end_time=? " +
                            "WHERE id=?",
                    ps -> {
                        ps.setString(1, cmd.leaveType);
                        ps.setBoolean(2, cmd.allDay);
                        ps.setTimestamp(3, Timestamp.valueOf(st));
                        ps.setTimestamp(4, Timestamp.valueOf(et));
                        ps.setLong(5, existingId);
                    }
            );
        }

        return new LeaveRequestDto(
                cmd.shiftId,
                cmd.leaveType,
                cmd.allDay,
                d.toString(),
                st.toLocalTime().withSecond(0).withNano(0).toString(),
                et.toLocalTime().withSecond(0).withNano(0).toString()
        );
    }

    // 回显：取当前用户在某班次的请假数据
    public LeaveRequestDto getMine(String email, Long uid, long shiftId) {
        Long staffId = resolveStaffId(email, uid);
        if (staffId == null) return null;

        try {
            return jdbc.queryForObject(
                    """
                    SELECT shift_id, leave_type, all_day, start_time, end_time
                    FROM leave_request
                    WHERE staff_id=? AND shift_id=?
                    LIMIT 1
                    """,
                    (rs, rn) -> {
                        var st = rs.getTimestamp("start_time").toLocalDateTime();
                        var et = rs.getTimestamp("end_time").toLocalDateTime();
                        return new LeaveRequestDto(
                                rs.getLong("shift_id"),
                                rs.getString("leave_type"),
                                rs.getBoolean("all_day"),
                                st.toLocalDate().toString(),
                                st.toLocalTime().withSecond(0).withNano(0).toString(),
                                et.toLocalTime().withSecond(0).withNano(0).toString()
                        );
                    },
                    staffId, shiftId
            );
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }
}
