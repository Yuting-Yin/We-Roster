package com.weroster.service;

import com.weroster.Dto.DeptRefDto;
import com.weroster.Dto.ShiftPreviewDto;
import com.weroster.Dto.TeamMemberDto;
import com.weroster.Dto.TeamSummaryDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Service
public class MyTeamService {
    private final JdbcTemplate jdbc;

    public MyTeamService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * List "my team": everyone who shares at least one department with the caller.
     * Uses MySQL 8+ (CTEs + window functions).
     */
    public List<TeamMemberDto> list(String callerEmail, String q, Long deptId, int limit, int offset) {
        StringBuilder sql = new StringBuilder("""
    SELECT
      s.id,
      s.first_name, s.last_name, s.email, s.phone,
      s.is_manager, s.status,
      /* one designation per staff → safe to MAX() when ONLY_FULL_GROUP_BY is on */
      MAX(dsg.name)   AS designation_name,
      MAX(dsg.code)   AS designation_code,
      MAX(dsg.matrix) AS designation_matrix,

      /* pack departments (distinct + ordered) */
      GROUP_CONCAT(DISTINCT CONCAT(d.id, '|', d.name, '|', IF(sd.is_primary,'1','0'))
                   ORDER BY d.name SEPARATOR ',') AS depts_enc,

      /* next future shift (by min start_ts) */
      MAX(shn.id)          AS next_shift_id,
      MAX(shn.start_ts)    AS next_start_ts,
      MAX(shn.end_ts)      AS next_end_ts,
      MAX(shn.location_id) AS next_loc_id,
      MAX(loc.name)        AS next_loc_name
    FROM staff s
    /* staff's departments */
    LEFT JOIN staff_department sd ON sd.staff_id = s.id
    LEFT JOIN dept d              ON d.id = sd.dept_id
    LEFT JOIN designation dsg     ON dsg.id = s.designation_id

    /* derive min future start per staff, then join the shift */
    LEFT JOIN (
      SELECT sa.staff_id, MIN(sh.start_ts) AS min_start
      FROM shift_assignment sa
      JOIN shift sh ON sh.id = sa.shift_id
      WHERE sh.start_ts >= NOW()
      GROUP BY sa.staff_id
    ) nxt ON nxt.staff_id = s.id
    LEFT JOIN shift shn ON shn.start_ts = nxt.min_start
                       AND EXISTS (
                         SELECT 1 FROM shift_assignment sa2
                         WHERE sa2.staff_id = s.id AND sa2.shift_id = shn.id
                       )
    LEFT JOIN location loc ON loc.id = shn.location_id

    /* must share at least one dept with the caller */
    WHERE EXISTS (
      SELECT 1
      FROM staff me
      JOIN staff_department sdm ON sdm.staff_id = me.id
      JOIN staff_department sdo ON sdo.dept_id = sdm.dept_id AND sdo.staff_id = s.id
      WHERE LOWER(me.email) = LOWER(?)
    )
  """);

        List<Object> params = new ArrayList<>();
        params.add(callerEmail);

        if (q != null && !q.isBlank()) {
            sql.append(" AND CONCAT_WS(' ', s.first_name, s.last_name, s.email) LIKE ? ");
            params.add("%" + q + "%");
        }

        if (deptId != null) {
            sql.append(" AND EXISTS (SELECT 1 FROM staff_department sdx WHERE sdx.staff_id = s.id AND sdx.dept_id = ?) ");
            params.add(deptId);
        }

        sql.append("""
    GROUP BY s.id
    ORDER BY s.last_name, s.first_name
    LIMIT ? OFFSET ?
  """);
        params.add(limit);
        params.add(offset);

        return jdbc.query(sql.toString(), params.toArray(), (rs, rowNum) -> mapTeamMember(rs));
    }

    private TeamMemberDto mapTeamMember(ResultSet rs) throws SQLException {
        TeamMemberDto dto = new TeamMemberDto();
        dto.id = rs.getLong("id");
        dto.firstName = rs.getString("first_name");
        dto.lastName = rs.getString("last_name");
        dto.email = rs.getString("email");
        dto.phone = rs.getString("phone");
        dto.isManager = rs.getBoolean("is_manager");
        dto.status = rs.getString("status");
        dto.designationName = rs.getString("designation_name");
        dto.designationCode = rs.getString("designation_code");
        dto.designationMatrix = rs.getString("designation_matrix");

        // decode packed departments
        String enc = rs.getString("depts_enc");
        List<DeptRefDto> depts = new ArrayList<>();
        if (enc != null && !enc.isEmpty()) {
            for (String token : enc.split(",")) {
                String[] p = token.split("\\|", -1);
                if (p.length >= 3) {
                    Long id = p[0].isEmpty() ? null : Long.valueOf(p[0]);
                    String name = p[1];
                    boolean isPrimary = "1".equals(p[2]);
                    depts.add(new DeptRefDto(id, name, isPrimary));
                }
            }
        }
        dto.departments = depts;

        Long nextId = (Long) rs.getObject("next_shift_id");
        if (nextId != null) {
            dto.nextShift = new ShiftPreviewDto(
                    nextId,
                    rs.getTimestamp("next_start_ts").toLocalDateTime(),
                    rs.getTimestamp("next_end_ts").toLocalDateTime(),
                    (Long) rs.getObject("next_loc_id"),
                    rs.getString("next_loc_name")
            );
        } else {
            dto.nextShift = null;
        }

        return dto;
    }

    /**
     * Aggregated counts for the caller's team.
     */
    public TeamSummaryDto summary(String callerEmail, Long deptId, String q) {
        StringBuilder sql = new StringBuilder("""
                  SELECT
                    COUNT(DISTINCT s.id) AS total,
                    SUM(CASE WHEN UPPER(s.status) = 'ACTIVE' THEN 1 ELSE 0 END) AS active,
                    SUM(CASE WHEN s.is_manager THEN 1 ELSE 0 END) AS managers
                  FROM staff s
                  WHERE EXISTS (
                    SELECT 1
                    FROM staff me
                    JOIN staff_department sdm ON sdm.staff_id = me.id
                    JOIN staff_department sdo ON sdo.dept_id = sdm.dept_id AND sdo.staff_id = s.id
                    WHERE LOWER(me.email) = LOWER(?)
                  )
                """);

        List<Object> params = new ArrayList<>();
        params.add(callerEmail);

        if (q != null && !q.isBlank()) {
            sql.append(" AND CONCAT_WS(' ', s.first_name, s.last_name, s.email) LIKE ? ");
            params.add("%" + q + "%");
        }

        if (deptId != null) {
            sql.append(" AND EXISTS (SELECT 1 FROM staff_department sdx WHERE sdx.staff_id = s.id AND sdx.dept_id = ?) ");
            params.add(deptId);
        }

        return jdbc.queryForObject(sql.toString(), params.toArray(),
                (rs, rn) -> new TeamSummaryDto(
                        rs.getInt("total"),
                        rs.getInt("active"),
                        rs.getInt("managers")));
    }
}
