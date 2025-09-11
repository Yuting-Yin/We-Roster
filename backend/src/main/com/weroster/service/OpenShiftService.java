package main.com.weroster.service;

import main.com.weroster.Dto.OpenShiftCompareDto;
import main.com.weroster.Dto.OpenShiftDetailDto;
import main.com.weroster.Dto.OpenShiftDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OpenShiftService {
    private final JdbcTemplate jdbc;
    public OpenShiftService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<OpenShiftDto> list(int limit, int offset) {
        // Tables/cols used:
        // open_shift(shift_id, date_made), shift(id, start_ts)  → future shifts only
        String sql = """
        SELECT os.shift_id, os.date_made
        FROM open_shift os
        JOIN shift sh ON sh.id = os.shift_id
        WHERE sh.start_ts >= NOW()
        ORDER BY os.date_made DESC, sh.start_ts ASC
        LIMIT ? OFFSET ?
        """;
        return jdbc.query(sql, ps -> {
            ps.setInt(1, limit);
            ps.setInt(2, offset);
        }, (rs, i) -> new OpenShiftDto(
                rs.getLong("shift_id"),
                rs.getTimestamp("date_made").toInstant()
        ));
    }
    public OpenShiftCompareDto compare(Instant fromA, Instant toA,
                                       Instant fromB, Instant toB,
                                       Long deptId) {
        List<OpenShiftDetailDto> a = fetchWindow(fromA, toA, deptId);
        List<OpenShiftDetailDto> b = fetchWindow(fromB, toB, deptId);

        Map<Long, OpenShiftDetailDto> mapA = a.stream()
                .collect(Collectors.toMap(s -> s.shiftId, s -> s, (x, y)->x));
        Map<Long, OpenShiftDetailDto> mapB = b.stream()
                .collect(Collectors.toMap(s -> s.shiftId, s -> s, (x,y)->x));

        List<OpenShiftDetailDto> newShifts = new ArrayList<>();
        List<OpenShiftDetailDto> removedShifts = new ArrayList<>();
        List<OpenShiftDetailDto> unchangedShifts = new ArrayList<>();

        // in B but not in A
        for (Long id : mapB.keySet()) {
            if (!mapA.containsKey(id)) newShifts.add(mapB.get(id));
        }
        // in A but not in B
        for (Long id : mapA.keySet()) {
            if (!mapB.containsKey(id)) removedShifts.add(mapA.get(id));
        }
        // in both
        for (Long id : mapB.keySet()) {
            if (mapA.containsKey(id)) unchangedShifts.add(mapB.get(id));
        }

        // sort for stable output
        Comparator<OpenShiftDetailDto> byStart = Comparator.comparing(s -> s.startTs);
        newShifts.sort(byStart);
        removedShifts.sort(byStart);
        unchangedShifts.sort(byStart);

        return new OpenShiftCompareDto(newShifts, removedShifts, unchangedShifts);
    }

    private List<OpenShiftDetailDto> fetchWindow(Instant from, Instant to, Long deptId) {
        StringBuilder sql = new StringBuilder("""
        SELECT sh.id AS shift_id, sh.start_ts, sh.end_ts,
               sh.dept_id, sh.location_id, sh.code, os.date_made
        FROM open_shift os
        JOIN shift sh ON sh.id = os.shift_id
        WHERE sh.start_ts >= ? AND sh.start_ts < ?
        """);
        List<Object> params = new ArrayList<>(List.of(Timestamp.from(from), Timestamp.from(to)));

        if (deptId != null) {
            sql.append(" AND sh.dept_id = ? ");
            params.add(deptId);
        }

        sql.append(" ORDER BY sh.start_ts ASC ");

        return jdbc.query(sql.toString(), params.toArray(), (rs, i) ->
                new OpenShiftDetailDto(
                        rs.getLong("shift_id"),
                        rs.getTimestamp("start_ts").toInstant(),
                        rs.getTimestamp("end_ts").toInstant(),
                        rs.getLong("dept_id"),
                        rs.getLong("location_id"),
                        rs.getString("code"),
                        rs.getTimestamp("date_made").toInstant()
                ));
    }
}
