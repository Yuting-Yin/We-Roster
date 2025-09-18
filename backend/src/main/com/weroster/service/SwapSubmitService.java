// src/main/com/weroster/service/SwapSubmitService.java
package main.com.weroster.service;

import main.com.weroster.Dto.SubmissionResponse;
import main.com.weroster.Dto.SwapSubmitCommand;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class SwapSubmitService {
    private final JdbcTemplate jdbc;
    public SwapSubmitService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private Long staffIdByEmail(String email){
        if (email == null) return null;
        return jdbc.query(
                "SELECT id FROM staff WHERE LOWER(email)=LOWER(?) LIMIT 1",
                ps -> ps.setString(1, email),
                rs -> rs.next() ? rs.getLong(1) : null
        );
    }

    @Transactional
    public SubmissionResponse submit(String currentEmail, SwapSubmitCommand cmd){
        Long me = staffIdByEmail(currentEmail);
        if (me == null)
            return SubmissionResponse.err("SESSION_EXPIRED","Login required.");

        if (cmd.requesterShiftId == null || cmd.targetStaffId == null || cmd.targetShiftId == null)
            return SubmissionResponse.err("VALIDATION_ERROR","Missing required fields.");

        // 校验：我是否在 requesterShiftId
        Integer mineCnt = jdbc.queryForObject(
                "SELECT COUNT(*) FROM shift_assignment WHERE shift_id=? AND staff_id=?",
                Integer.class,
                cmd.requesterShiftId,
                me
        );
        if (mineCnt == null || mineCnt == 0)
            return SubmissionResponse.err("VALIDATION_ERROR","You are not assigned to the requester shift.");

        // 校验：对方是否在 targetShiftId
        Integer hisCnt = jdbc.queryForObject(
                "SELECT COUNT(*) FROM shift_assignment WHERE shift_id=? AND staff_id=?",
                Integer.class,
                cmd.targetShiftId,
                cmd.targetStaffId
        );
        if (hisCnt == null || hisCnt == 0)
            return SubmissionResponse.err("VALIDATION_ERROR","Target staff is not assigned to the target shift.");

        // 查是否已有未结 swap
        Integer dupCnt = jdbc.queryForObject(
                "SELECT COUNT(*) FROM swap_request " +
                        "WHERE requester_staff_id=? AND requester_shift_id=? " +
                        "AND target_staff_id=? AND target_shift_id=? AND active=1",
                Integer.class,
                me,
                cmd.requesterShiftId,
                cmd.targetStaffId,
                cmd.targetShiftId
        );
        if (dupCnt != null && dupCnt > 0)
            return SubmissionResponse.err("DUPLICATE_REQUEST","A pending swap request already exists for these shifts.");

        // 插入
        jdbc.update(
                "INSERT INTO swap_request " +
                        "(requester_staff_id, requester_shift_id, target_staff_id, target_shift_id, status, active) " +
                        "VALUES (?,?,?,?, 'PENDING', 1)",
                me,
                cmd.requesterShiftId,
                cmd.targetStaffId,
                cmd.targetShiftId
        );

        return SubmissionResponse.okPending(Map.of(
                "requesterShiftId", cmd.requesterShiftId,
                "targetStaffId", cmd.targetStaffId,
                "targetShiftId", cmd.targetShiftId
        ));
    }
}
