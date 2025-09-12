// src/main/java/main/com/weroster/service/OpenShiftService.java
package main.com.weroster.service;

import main.com.weroster.Dto.OpenShiftCompareResult;
import main.com.weroster.Dto.OpenShiftDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.*;
import java.util.*;

@Service
public class OpenShiftService {

    private final JdbcTemplate jdbc;
    public OpenShiftService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    // Matches your controller exactly
    public List<OpenShiftDto> list(String from, String to, String day,
                                   Long deptId, Long locationId, String roleCode,
                                   boolean urgentOnly, Integer minExtraPay, boolean mineOnly,
                                   int limit, int offset) {
        StringBuilder sql = new StringBuilder(
                "SELECT sh.id AS shift_id, sh.start_ts, sh.end_ts, " +
                        "       sh.dept_id, d.name AS dept_name, " +
                        "       sh.location_id, l.name AS location_name, " +
                        "       sh.code AS role_code, " +
                        "       COALESCE(os.urgent_flag, 0) AS urgent_flag, " +
                        "       COALESCE(os.extra_pay_cents, 0) AS extra_pay_cents " +
                        "FROM shift sh " +
                        "LEFT JOIN dept d ON d.id = sh.dept_id " +
                        "LEFT JOIN location l ON l.id = sh.location_id " +
                        "LEFT JOIN open_shift os ON os.shift_id = sh.id " + // ok if table exists; LEFT join keeps compatibility
                        // open = no assignment
                        "LEFT JOIN shift_assignment sa ON sa.shift_id = sh.id " +
                        "WHERE sa.shift_id IS NULL "
        );

        List<Object> params = new ArrayList<>();

        // time window
        Timestamp fromTs = parseTs(from, true);
        if (fromTs != null) { sql.append(" AND sh.start_ts >= ? "); params.add(fromTs); }
        Timestamp toTs = parseTs(to, false);
        if (toTs != null)   { sql.append(" AND sh.start_ts < ? ");  params.add(toTs); }

        // day-of-week filter (Mon..Sun or comma-separated)
        List<Integer> dows = parseDays(day);
        if (!dows.isEmpty()) {
            sql.append(" AND DAYOFWEEK(sh.start_ts) IN (");
            sql.append(String.join(",", Collections.nCopies(dows.size(), "?")));
            sql.append(") ");
            params.addAll(dows);
        }

        if (deptId != null)     { sql.append(" AND sh.dept_id = ? "); params.add(deptId); }
        if (locationId != null) { sql.append(" AND sh.location_id = ? "); params.add(locationId); }
        if (roleCode != null && !roleCode.isBlank()) {
            sql.append(" AND sh.code LIKE ? ");
            params.add("%" + roleCode + "%");
        }

        if (urgentOnly) {
            // If open_shift table/flags not present for a row, fall back to keyword heuristic
            sql.append(" AND (COALESCE(os.urgent_flag,0)=1 " +
                    "      OR UPPER(COALESCE(sh.code,'')) LIKE '%URGENT%' " +
                    "      OR UPPER(COALESCE(sh.note,'')) LIKE '%URGENT%') ");
        }

        if (minExtraPay != null && minExtraPay > 0) {
            sql.append(" AND COALESCE(os.extra_pay_cents,0) >= ? ");
            params.add(minExtraPay);
        }

        if (mineOnly) {
            String email = currentUserEmail();
            if (email != null && !email.isBlank()) {
                sql.append(" AND sh.dept_id IN ( " +
                        "   SELECT sd.dept_id " +
                        "   FROM staff_department sd " +
                        "   JOIN staff s ON s.id = sd.staff_id " +
                        "   WHERE LOWER(s.email) = LOWER(?) " +
                        ") ");
                params.add(email);
            }
        }

        sql.append(" ORDER BY sh.start_ts ASC LIMIT ? OFFSET ? ");
        params.add(limit);
        params.add(offset);

        return jdbc.query(sql.toString(), params.toArray(), (rs, rn) -> {
            OpenShiftDto dto = new OpenShiftDto();
            dto.shiftId = rs.getLong("shift_id");
            dto.startTs = rs.getTimestamp("start_ts").toLocalDateTime();
            dto.endTs   = rs.getTimestamp("end_ts").toLocalDateTime();
            dto.deptId = (Long) rs.getObject("dept_id");
            dto.deptName = rs.getString("dept_name");
            dto.locationId = (Long) rs.getObject("location_id");
            dto.locationName = rs.getString("location_name");
            dto.role = rs.getString("role_code");
            dto.urgent = rs.getInt("urgent_flag") == 1;
            dto.extraPayCents = (Integer) rs.getObject("extra_pay_cents");
            return dto;
        });
    }

    // For /open-shifts/compare
    public OpenShiftCompareResult compare(String aFrom, String aTo,
                                          String bFrom, String bTo,
                                          Long deptId) {
        List<Long> a = idsInWindow(aFrom, aTo, deptId);
        List<Long> b = idsInWindow(bFrom, bTo, deptId);

        Set<Long> aSet = new HashSet<>(a);
        Set<Long> bSet = new HashSet<>(b);

        List<Long> added = new ArrayList<>();
        for (Long id : bSet) if (!aSet.contains(id)) added.add(id);

        List<Long> removed = new ArrayList<>();
        for (Long id : aSet) if (!bSet.contains(id)) removed.add(id);

        return new OpenShiftCompareResult(a.size(), b.size(), added, removed);
    }

    // Helpers

    private List<Long> idsInWindow(String from, String to, Long deptId) {
        StringBuilder sb = new StringBuilder(
                "SELECT sh.id " +
                        "FROM shift sh " +
                        "LEFT JOIN shift_assignment sa ON sa.shift_id = sh.id " +
                        "WHERE sa.shift_id IS NULL "
        );
        List<Object> p = new ArrayList<>();

        Timestamp f = parseTs(from, true);
        if (f != null) { sb.append(" AND sh.start_ts >= ? "); p.add(f); }
        Timestamp t = parseTs(to, false);
        if (t != null) { sb.append(" AND sh.start_ts < ? ");  p.add(t); }
        if (deptId != null) { sb.append(" AND sh.dept_id = ? "); p.add(deptId); }

        sb.append(" ORDER BY sh.start_ts ASC ");
        return jdbc.query(sb.toString(), p.toArray(), (rs, rn) -> rs.getLong(1));
    }

    private static Timestamp parseTs(String s, boolean start) {
        if (s == null || s.isBlank()) return null;
        try {
            // Accept: YYYY-MM-DD
            if (s.length() <= 10) {
                LocalDate d = LocalDate.parse(s);
                return Timestamp.valueOf(start ? d.atStartOfDay() : d.plusDays(1).atStartOfDay());
            }
            // Accept: full ISO8601 Z or local datetime
            try { return Timestamp.from(Instant.parse(s)); }
            catch (Exception ignore) { return Timestamp.valueOf(LocalDateTime.parse(s)); }
        } catch (Exception e) {
            return null;
        }
    }

    // Accept "Mon", "Tue", ... or comma-separated e.g. "Mon,Wed,Fri"
    private static List<Integer> parseDays(String dayParam) {
        if (dayParam == null || dayParam.isBlank()) return Collections.emptyList();
        Map<String,Integer> map = Map.ofEntries(
                Map.entry("SUN", 1), Map.entry("MON", 2), Map.entry("TUE", 3),
                Map.entry("WED", 4), Map.entry("THU", 5), Map.entry("FRI", 6), Map.entry("SAT", 7)
        );
        List<Integer> out = new ArrayList<>();
        for (String tok : dayParam.split(",")) {
            String k = tok.trim().toUpperCase(Locale.ROOT);
            Integer v = map.get(k);
            if (v != null) out.add(v);
        }
        return out;
    }

    private static String currentUserEmail() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        Object p = auth.getPrincipal();
        return p == null ? null : p.toString();
    }
    // src/main/java/main/com/weroster/service/OpenShiftService.java
// (package name as in your project)
    public List<OpenShiftDto> list(int limit, int offset) {
        int lim = Math.max(1, Math.min(100, limit));
        int off = Math.max(0, offset);
        // delegate to the full signature with "no filters"
        return list(
                null,  // from
                null,  // to
                null,  // day
                null,  // deptId
                null,  // locationId
                null,  // roleCode
                false, // urgentOnly
                null,  // minExtraPay
                false, // mineOnly
                lim,
                off
        );
    }

}
