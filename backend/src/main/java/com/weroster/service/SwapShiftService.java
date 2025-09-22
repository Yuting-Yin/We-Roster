// src/main/com/weroster/service/SwapShiftService.java
package com.weroster.service;

import com.weroster.Dto.SwapCandidateItemDto;
import com.weroster.Dto.SwapShiftMineDto;
import com.weroster.Dto.SwapShiftResponse;
import com.weroster.Dto.*;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SwapShiftService {
    private final JdbcTemplate jdbc;

    public SwapShiftService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // 你项目里已有“email -> staffId”的解析，这里复用最简单写法
    private Long resolveStaffIdByEmail(String email) {
        if (email == null) return null;
        return jdbc.query(
                "SELECT id FROM staff WHERE LOWER(email)=LOWER(?) LIMIT 1",
                ps -> ps.setString(1, email),
                rs -> rs.next() ? rs.getLong(1) : null
        );
    }

    public SwapShiftResponse buildSwapData(long shiftId, String currentUserEmail) {
        Long myStaffId = resolveStaffIdByEmail(currentUserEmail);
        if (myStaffId == null) throw new IllegalArgumentException("No staff mapped to current user");

        // 1) 自己这条班次信息（需要确保当前用户确实在该班次）
        var mine = queryMyShift(shiftId, myStaffId);

        // 2) 候选可互换对象：同部门&同地点，时间重叠，且不是自己
        var candidates = queryCandidates(shiftId, myStaffId);

        var resp = new SwapShiftResponse();
        resp.mine = mine;

        var sec = new SwapShiftResponse.SearchSection();
        sec.total = candidates.size();
        sec.items = candidates;
        resp.search = sec;

        return resp;
    }

    private static final DateTimeFormatter DF_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DF_TIME = DateTimeFormatter.ofPattern("HH:mm");

    private SwapShiftMineDto queryMyShift(long shiftId, long myStaffId) {
        String sql = """
            SELECT s.id AS shift_id,
                   s.start_ts, s.end_ts,
                   d.name AS campus,
                   l.name AS location,
                   st.first_name, st.last_name
            FROM shift s
            JOIN shift_assignment sa ON sa.shift_id = s.id
            JOIN staff st ON st.id = sa.staff_id
            LEFT JOIN dept d ON d.id = s.dept_id
            LEFT JOIN location l ON l.id = s.location_id
            WHERE s.id = ? AND sa.staff_id = ?
            LIMIT 1
        """;
        try {
            return jdbc.queryForObject(sql, (rs, rn) -> {
                LocalDateTime start = rs.getTimestamp("start_ts").toLocalDateTime();
                LocalDateTime end   = rs.getTimestamp("end_ts").toLocalDateTime();
                var dto = new SwapShiftMineDto();
                dto.shiftId  = rs.getLong("shift_id");
                dto.initials = initials(rs.getString("first_name"), rs.getString("last_name"));
                dto.date     = DF_DATE.format(start.toLocalDate());
                dto.startTime= DF_TIME.format(start.toLocalTime());
                dto.endTime  = DF_TIME.format(end.toLocalTime());
                dto.campus   = rs.getString("campus");
                dto.location = rs.getString("location");
                return dto;
            }, shiftId, myStaffId);
        } catch (EmptyResultDataAccessException e) {
            throw new IllegalArgumentException("Shift not found or not assigned to current user");
        }
    }

    private List<SwapCandidateItemDto> queryCandidates(long shiftId, long myStaffId) {
        // 先取目标班次的时间窗、部门、地点
        var window = jdbc.queryForObject(
                "SELECT start_ts, end_ts, dept_id, location_id FROM shift WHERE id=?",
                (rs, rn) -> new Object[]{
                        rs.getTimestamp("start_ts").toLocalDateTime(),
                        rs.getTimestamp("end_ts").toLocalDateTime(),
                        rs.getObject("dept_id", Long.class),
                        rs.getObject("location_id", Long.class)
                },
                shiftId
        );
        LocalDateTime sStart = (LocalDateTime) window[0];
        LocalDateTime sEnd   = (LocalDateTime) window[1];
        Long deptId          = (Long) window[2];
        Long locationId      = (Long) window[3];

        // 时间重叠判断： (a.start < b.end) AND (a.end > b.start)
        String sql = """
            SELECT st.id AS staff_id,
                   CONCAT(st.first_name, ' ', st.last_name) AS staff_name,
                   st.first_name, st.last_name,
                   s.start_ts, s.end_ts,
                   d.name AS campus,
                   l.name AS location
            FROM shift s
            JOIN shift_assignment sa ON sa.shift_id = s.id
            JOIN staff st ON st.id = sa.staff_id
            LEFT JOIN dept d ON d.id = s.dept_id
            LEFT JOIN location l ON l.id = s.location_id
            WHERE sa.staff_id <> ?
              AND (? IS NULL OR s.dept_id = ?)
              AND (? IS NULL OR s.location_id = ?)
              AND s.start_ts < ?  -- overlap cond 1
              AND s.end_ts   > ?  -- overlap cond 2
            ORDER BY s.start_ts ASC
            LIMIT 100
        """;

        return jdbc.query(sql, ps -> {
            int i = 1;
            ps.setLong(i++, myStaffId);
            // dept/location 为空时不过滤
            if (deptId == null) { ps.setObject(i++, null); ps.setObject(i++, null); }
            else { ps.setLong(i++, deptId); ps.setLong(i++, deptId); }
            if (locationId == null) { ps.setObject(i++, null); ps.setObject(i++, null); }
            else { ps.setLong(i++, locationId); ps.setLong(i++, locationId); }
            ps.setTimestamp(i++, java.sql.Timestamp.valueOf(sEnd));
            ps.setTimestamp(i,   java.sql.Timestamp.valueOf(sStart));
        }, (rs, rn) -> {
            var item = new SwapCandidateItemDto();
            item.staffId   = rs.getLong("staff_id");
            item.staffName = rs.getString("staff_name");
            item.initials  = initials(rs.getString("first_name"), rs.getString("last_name"));
            item.startTime = DF_TIME.format(rs.getTimestamp("start_ts").toLocalDateTime().toLocalTime());
            item.endTime   = DF_TIME.format(rs.getTimestamp("end_ts").toLocalDateTime().toLocalTime());
            item.campus    = rs.getString("campus");
            item.location  = rs.getString("location");
            return item;
        });
    }

    private static String initials(String first, String last) {
        String a = (first == null || first.isEmpty()) ? "" : first.substring(0, 1).toUpperCase();
        String b = (last  == null || last.isEmpty())  ? "" : last.substring(0, 1).toUpperCase();
        return a + b;
    }
}
