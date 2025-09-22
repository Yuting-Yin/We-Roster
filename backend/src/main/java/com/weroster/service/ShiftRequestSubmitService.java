// src/main/com/weroster/service/ShiftRequestSubmitService.java
package com.weroster.service;

import com.weroster.Dto.ShiftRequestSubmitCommand;
import com.weroster.Dto.SubmissionResponse;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class ShiftRequestSubmitService {
    private final JdbcTemplate jdbc;
    public ShiftRequestSubmitService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private Long staffIdByEmail(String email) {
        if (email == null) return null;
        try {
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
    public SubmissionResponse submit(String currentEmail, Long shiftId, ShiftRequestSubmitCommand cmd) {
        // 4) session expired
        Long staffId = staffIdByEmail(currentEmail);
        if (staffId == null) return SubmissionResponse.err("SESSION_EXPIRED","Login required.");
        if (shiftId == null)   return SubmissionResponse.err("VALIDATION_ERROR","Missing path param: shiftId.");

        // 3) validation：shift 是否存在
        Integer sCnt = jdbc.queryForObject(
                "SELECT COUNT(*) FROM shift WHERE id = ?",
                Integer.class, shiftId
        );
        if (sCnt == null || sCnt == 0)
            return SubmissionResponse.err("VALIDATION_ERROR","Shift not found.");

        // 3) validation：必须是 Unallocated（没有任何分配）
        Integer allocCnt = jdbc.queryForObject(
                "SELECT COUNT(*) FROM shift_assignment WHERE shift_id = ?",
                Integer.class, shiftId
        );
        if (allocCnt != null && allocCnt > 0)
            return SubmissionResponse.err("VALIDATION_ERROR","Shift is not unallocated.");

        // 2) duplicate：是否已有未结的申请
        Integer dupCnt = jdbc.queryForObject(
                "SELECT COUNT(*) FROM shift_request WHERE staff_id=? AND shift_id=? AND active=1",
                Integer.class, staffId, shiftId
        );
        if (dupCnt != null && dupCnt > 0)
            return SubmissionResponse.err("DUPLICATE_REQUEST","You already have a pending request for this shift.");

        // 1) success → pending
        jdbc.update(
                "INSERT INTO shift_request (shift_id, staff_id, note, status, active) VALUES (?,?,?,?,1)",
                shiftId, staffId, (cmd != null ? cmd.note : null), "PENDING"
        );

        return SubmissionResponse.okPending(Map.of(
                "shiftId", shiftId
        ));
    }
}
