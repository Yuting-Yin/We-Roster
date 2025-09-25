// src/main/com/weroster/service/LeaveSubmitService.java
package main.com.weroster.service;

import main.com.weroster.Dto.CreateLeaveRequestCommand;
import main.com.weroster.Dto.SubmissionResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;

@Service
public class LeaveSubmitService {
    private final JdbcTemplate jdbc;

    public LeaveSubmitService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private Long staffIdByEmail(String email) {
        if (email == null) return null;
        try {
            // 单列查询直接映射 Long；没有记录会抛 EmptyResultDataAccessException
            return jdbc.queryForObject(
                    "SELECT id FROM staff WHERE LOWER(email)=LOWER(?) LIMIT 1",
                    Long.class,
                    email
            );
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    @Transactional
    public SubmissionResponse submit(String currentEmail, CreateLeaveRequestCommand cmd) {
        // 4) session expired
        Long staffId = staffIdByEmail(currentEmail);
        if (staffId == null) {
            return SubmissionResponse.err("SESSION_EXPIRED", "Login required.");
        }

        // 3) validation problem – 基本字段
        if (cmd.shiftId == null || cmd.leaveType == null || cmd.date == null) {
            return SubmissionResponse.err("VALIDATION_ERROR", "Missing required fields: shiftId/leaveType/date.");
        }

        LocalDate d = LocalDate.parse(cmd.date);
        LocalDateTime st = cmd.allDay ? d.atStartOfDay()
                : LocalDateTime.of(d, LocalTime.parse(cmd.startTime));
        LocalDateTime et = cmd.allDay ? d.atTime(23, 59)
                : LocalDateTime.of(d, LocalTime.parse(cmd.endTime));
        if (!et.isAfter(st)) {
            return SubmissionResponse.err("VALIDATION_ERROR", "endTime must be after startTime.");
        }

        // 3) validation problem – 是否在该班次
        Integer assignedCnt = jdbc.queryForObject(
                "SELECT COUNT(*) FROM shift_assignment WHERE shift_id=? AND staff_id=?",
                Integer.class,
                cmd.shiftId,    // 直接传 Long 即可
                staffId
        );
        boolean assigned = assignedCnt != null && assignedCnt > 0;
        if (!assigned) {
            return SubmissionResponse.err("VALIDATION_ERROR", "You are not assigned to this shift.");
        }

        // 2) duplicated request – 查 open 记录（active=1）
        Integer openCnt = jdbc.queryForObject(
                "SELECT COUNT(*) FROM leave_request WHERE staff_id=? AND shift_id=? AND active=1",
                Integer.class,
                staffId,
                cmd.shiftId
        );
        if (openCnt != null && openCnt > 0) {
            return SubmissionResponse.err("DUPLICATE_REQUEST", "You already have an open leave request for this shift.");
        }

        // 1) success → pending
        jdbc.update(
                "INSERT INTO leave_request " +
                        "(shift_id, staff_id, leave_type, all_day, start_time, end_time, status, active) " +
                        "VALUES (?,?,?,?,?,?, 'PENDING', 1)",
                cmd.shiftId,
                staffId,
                cmd.leaveType,
                cmd.allDay,
                Timestamp.valueOf(st),
                Timestamp.valueOf(et)
        );

        return SubmissionResponse.okPending(Map.of(
                "shiftId", cmd.shiftId,
                "leaveType", cmd.leaveType
        ));
    }
}
