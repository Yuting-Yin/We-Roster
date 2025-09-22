package com.weroster.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RosterApprovalService {
    private final JdbcTemplate jdbc;
    public RosterApprovalService(JdbcTemplate jdbc){ this.jdbc = jdbc; }

    @Transactional
    public void approveLeave(long leaveId, long approverId) {
        var r = jdbc.queryForMap(
                "SELECT staff_id, start_ts, end_ts FROM leave_request " +
                        "WHERE id=? AND status='PENDING'", leaveId);
        long staffId = ((Number) r.get("staff_id")).longValue();
        var start = (java.sql.Timestamp) r.get("start_ts");
        var end   = (java.sql.Timestamp) r.get("end_ts");

        // 删除该员工在该时间段内的所有班次分配（班变为未分配）
        jdbc.update("""
      DELETE sa FROM shift_assignment sa
      JOIN shift s ON s.id=sa.shift_id
      WHERE sa.staff_id=? AND s.start_ts < ? AND s.end_ts > ?
    """, staffId, end, start);

        jdbc.update("UPDATE leave_request SET status='APPROVED', decided_at=NOW(), decided_by=? WHERE id=?",
                approverId, leaveId);
    }

    @Transactional
    public void approveSwap(long swapId, long approverId) {
        var r = jdbc.queryForMap(
                "SELECT from_staff_id, to_staff_id, shift_id FROM swap_request " +
                        "WHERE id=? AND status='PENDING'", swapId);
        long fromId = ((Number) r.get("from_staff_id")).longValue();
        long toId   = ((Number) r.get("to_staff_id")).longValue();
        long sh     = ((Number) r.get("shift_id")).longValue();

        int n = jdbc.update("UPDATE shift_assignment SET staff_id=? WHERE shift_id=? AND staff_id=?",
                toId, sh, fromId);
        if (n==0) throw new IllegalStateException("原始分配不存在，无法换班");

        jdbc.update("UPDATE swap_request SET status='APPROVED', decided_at=NOW(), decided_by=? WHERE id=?",
                approverId, swapId);
    }

    @Transactional
    public void approveOpenApplication(long appId, long approverId) {
        var r = jdbc.queryForMap(
                "SELECT shift_id, staff_id FROM open_shift_application " +
                        "WHERE id=? AND status='PENDING'", appId);
        long sh  = ((Number) r.get("shift_id")).longValue();
        long sid = ((Number) r.get("staff_id")).longValue();

        // 确保该班目前“未分配”
        Integer cnt = jdbc.queryForObject("SELECT COUNT(*) FROM shift_assignment WHERE shift_id=?",
                Integer.class, sh);
        if (cnt!=null && cnt>0) throw new IllegalStateException("该班已被分配，不能作为开放班次批准");

        jdbc.update("INSERT INTO shift_assignment(staff_id, shift_id, is_lead) VALUES (?, ?, 0)", sid, sh);

        jdbc.update("UPDATE open_shift_application SET status='APPROVED', decided_at=NOW(), decided_by=? WHERE id=?",
                approverId, appId);
    }
}