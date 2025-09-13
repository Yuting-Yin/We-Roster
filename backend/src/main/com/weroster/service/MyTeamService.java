package main.com.weroster.service;

import main.com.weroster.Dto.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
      shn.id          AS next_shift_id,
      shn.start_ts    AS next_start_ts,
      shn.end_ts      AS next_end_ts,
      shn.location_id AS next_loc_id,
      loc.name        AS next_loc_name
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
    public TeamAboutDto about(String callerEmail, Long memberId) {
        Objects.requireNonNull(callerEmail, "callerEmail");
        Objects.requireNonNull(memberId, "memberId");

        String sql = """
          WITH me AS (
            SELECT s.id AS me_id FROM staff s WHERE LOWER(s.email)=LOWER(?)
          ),
          allowed AS (
            SELECT 1
            FROM staff_department ms
            JOIN staff_department ts ON ts.dept_id = ms.dept_id
            JOIN me ON me.me_id = ms.staff_id
            WHERE ts.staff_id = ?
            LIMIT 1
          )
          SELECT s.id, s.first_name, s.last_name, s.phone, s.email,
                 dsg.name AS role_title, dsg.accreditation AS accreditation
          FROM staff s
          JOIN allowed a ON 1=1
          LEFT JOIN designation dsg ON dsg.id = s.designation_id
          WHERE s.id = ?
        """;

        List<TeamAboutDto> rows = jdbc.query(sql, new Object[]{ callerEmail, memberId, memberId },
                (rs, rn) -> mapAbout(rs));
        if (rows.isEmpty()) throw new AccessDeniedException("Not allowed");
        return rows.get(0);
    }

    private TeamAboutDto mapAbout(ResultSet rs) throws SQLException {
        TeamAboutDto d = new TeamAboutDto();
        d.id = rs.getLong("id");
        d.firstName = rs.getString("first_name");
        d.lastName = rs.getString("last_name");
        d.phone = rs.getString("phone");
        d.email = rs.getString("email");
        d.roleTitle = rs.getString("role_title");
        d.accreditation = rs.getString("accreditation");

        String f = (d.firstName == null || d.firstName.isEmpty()) ? "" : d.firstName.substring(0,1);
        String l = (d.lastName  == null || d.lastName.isEmpty())  ? "" : d.lastName.substring(0,1);
        d.avatarInitials = (f + l).toUpperCase(Locale.ROOT);
        return d;
    }

    /** Returns a calendar-style schedule for a member in [from,to] (inclusive), grouped by day. */
    public TeamScheduleDto schedule(String callerEmail, Long memberId, LocalDate from, LocalDate to) {
        Objects.requireNonNull(callerEmail, "callerEmail");
        Objects.requireNonNull(memberId, "memberId");

        if (from == null || to == null || to.isBefore(from)) {
            // Default to the current month if bad/missing range
            LocalDate today = LocalDate.now();
            from = today.withDayOfMonth(1);
            to   = today.withDayOfMonth(today.lengthOfMonth());
        }

        // Check access first
        String guard = """
          WITH me AS (
            SELECT s.id AS me_id FROM staff s WHERE LOWER(s.email)=LOWER(?)
          )
          SELECT EXISTS(
            SELECT 1
            FROM staff_department ms
            JOIN staff_department ts ON ts.dept_id = ms.dept_id
            JOIN me ON me.me_id = ms.staff_id
            WHERE ts.staff_id = ?
          )
        """;
        Boolean allowed = jdbc.queryForObject(guard, new Object[]{ callerEmail, memberId }, Boolean.class);
        if (allowed == null || !allowed) throw new AccessDeniedException("Not allowed");

        // Fetch shifts in range and group by day
        String sql = """
          SELECT sh.id, sh.start_ts, sh.end_ts, sh.location_id, loc.name AS location_name
          FROM shift_assignment sa
          JOIN shift sh ON sh.id = sa.shift_id
          LEFT JOIN location loc ON loc.id = sh.location_id
          WHERE sa.staff_id = ?
            AND sh.start_ts >= ?
            AND sh.start_ts <  ?
          ORDER BY sh.start_ts ASC
        """;
        // end boundary is exclusive -> plus 1 day
        LocalDateTime fromTs = from.atStartOfDay();
        LocalDateTime toExclusive = to.plusDays(1).atStartOfDay();

        List<ShiftPreviewDto> flat = jdbc.query(sql, new Object[]{ memberId, fromTs, toExclusive }, (rs, rn) ->
                new ShiftPreviewDto(
                        rs.getLong("id"),
                        rs.getTimestamp("start_ts").toLocalDateTime(),
                        rs.getTimestamp("end_ts").toLocalDateTime(),
                        (Long) rs.getObject("location_id"),
                        rs.getString("location_name")
                )
        );

        Map<LocalDate, List<ShiftPreviewDto>> byDay = new LinkedHashMap<>();
        // initialize all days in range so the calendar can paint empty dates
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            byDay.put(d, new ArrayList<>());
        }
        for (ShiftPreviewDto s : flat) {
            LocalDate d = s.startTs.toLocalDate();
            byDay.computeIfAbsent(d, k -> new ArrayList<>()).add(s);
        }

        List<TeamScheduleDayDto> days = new ArrayList<>();
        for (Map.Entry<LocalDate, List<ShiftPreviewDto>> e : byDay.entrySet()) {
            days.add(new TeamScheduleDayDto(e.getKey(), e.getValue()));
        }

        TeamScheduleDto out = new TeamScheduleDto();
        out.memberId = memberId;
        out.fromDate = from;
        out.toDate = to;
        out.days = days;
        return out;
    }
}
