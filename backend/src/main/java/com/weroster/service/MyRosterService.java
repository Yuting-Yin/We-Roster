package com.weroster.service;

import com.weroster.Dto.*;
import org.springframework.context.annotation.Primary;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * My Roster service (复制即用)
 * - AM: 结束 <= 13:30
 * - PM: 开始 < 18:00 且不属于 AM
 * - AH: 其余（例如 18:00–23:00）
 */
@Service
@Primary
public class MyRosterService {
    private static final DateTimeFormatter HM = DateTimeFormatter.ofPattern("HH:mm");
    private static final LocalTime WIN_START = LocalTime.of(8, 0);
    private static final LocalTime WIN_END   = LocalTime.of(23, 59);

    private final JdbcTemplate jdbc;
    public MyRosterService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    // 优先 user_staff，再回退 staff.email
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

    /** 依据开始/结束时间推断 AM/PM/AH */
    private static String slotOf(LocalTime start, LocalTime end) {
        // 结束 <= 13:30 => AM
        if (!end.isAfter(LocalTime.of(13, 30))) return "AM";
        // 开始 < 18:00 => PM
        if (start.isBefore(LocalTime.of(18, 0))) return "PM";
        // 其余 => After-hours
        return "AH";
    }

    /** 首页 timeline：返回当日我被分配到的班 */
    public DayRosterDto day(String email, Long uid, LocalDate date) {
        Long staffId = resolveStaffId(email, uid);
        if (staffId == null) {
            return new DayRosterDto(date.toString(), List.of());
        }

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay   = date.atTime(23, 59, 59);

        String sql = """
            SELECT
              s.id,
              s.start_ts       AS startTs,
              s.end_ts         AS endTs,
              d.name           AS dept,
              l.name           AS location,
              COALESCE(sa.is_lead, 0) AS isLead,
              GREATEST((SELECT COUNT(*) FROM shift_assignment x WHERE x.shift_id = s.id) - 1, 0) AS coworkers
            FROM shift s
            JOIN shift_assignment sa ON sa.shift_id = s.id AND sa.staff_id = ?
            LEFT JOIN dept d      ON d.id = s.dept_id
            LEFT JOIN location l  ON l.id = s.location_id
            WHERE s.start_ts < ?  -- endOfDay
              AND s.end_ts   > ?  -- startOfDay
            ORDER BY s.start_ts
        """;

        List<ShiftItemDto> items = jdbc.query(sql, (rs, i) -> {
            LocalDateTime st = rs.getTimestamp("startTs").toLocalDateTime();
            LocalDateTime et = rs.getTimestamp("endTs").toLocalDateTime();

            // 关键：按时间计算 slot，写进 code
            String slot = slotOf(st.toLocalTime(), et.toLocalTime());

            return new ShiftItemDto(
                    rs.getLong("id"),
                    st.toString(),
                    et.toString(),
                    rs.getString("dept"),
                    rs.getString("location"),
                    slot, // 用计算后的 slot 作为 code
                    rs.getBoolean("isLead"),
                    rs.getInt("coworkers")
            );
        }, staffId, Timestamp.valueOf(endOfDay), Timestamp.valueOf(startOfDay));

        return new DayRosterDto(date.toString(), items);
    }

    /** Day View：时间轴 + 未占用块（前端切到某天时用） */
    public DayViewDto dayView(String email, Long uid, LocalDate date) {
        Long staffId = resolveStaffId(email, uid);
        var window = new DayWindowDto(WIN_START.toString(), WIN_END.toString());

        if (staffId == null) {
            return new DayViewDto(
                    date.toString(), window,
                    List.of(),
                    List.of(new UnallocatedItemDto(WIN_START.toString(), WIN_END.toString(), "Unallocated"))
            );
        }

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd   = date.atTime(23, 59, 59);

        String sql = """
          SELECT
            s.id        AS sid,
            s.start_ts  AS startTs,
            s.end_ts    AS endTs,
            l.id        AS loc_id,
            l.name      AS loc_name,
            l.code      AS loc_code,
            l.type      AS loc_type,
            TIMESTAMPDIFF(MINUTE, s.start_ts, s.end_ts) AS durationMinutes,
            GREATEST((SELECT COUNT(*) FROM shift_assignment sa2 WHERE sa2.shift_id = s.id) - 1, 0) AS coworkerCount,
            (SELECT dz.name FROM designation dz
               JOIN staff st2 ON st2.designation_id = dz.id
              WHERE st2.id = ?) AS designation
          FROM shift s
          JOIN shift_assignment sa ON sa.shift_id = s.id AND sa.staff_id = ?
          LEFT JOIN location l ON l.id = s.location_id
          WHERE s.start_ts < ? AND s.end_ts > ?
          ORDER BY s.start_ts
        """;

        List<AllocatedItemDto> allocated = jdbc.query(sql, (rs, i) -> {
            LocalDateTime st = rs.getTimestamp("startTs").toLocalDateTime();
            LocalDateTime et = rs.getTimestamp("endTs").toLocalDateTime();

            String shiftId   = String.valueOf(rs.getLong("sid"));        // ✅ 纯数字字符串，避免 “no real shift id”
            String startHHmm = st.toLocalTime().format(HM);
            String endHHmm   = et.toLocalTime().format(HM);

            var loc = new LocationDto(rs.getString("loc_name"), null, null);

            return new AllocatedItemDto(
                    shiftId,
                    startHHmm,
                    endHHmm,
                    rs.getInt("durationMinutes"),
                    loc,
                    rs.getString("designation"),
                    Math.max(0, rs.getInt("coworkerCount"))
            );
        }, staffId, staffId, Timestamp.valueOf(dayEnd), Timestamp.valueOf(dayStart));

        // 计算未占用 (Unallocated) 时间块（在 08:00~23:59 窗口内）
        List<UnallocatedItemDto> unallocated = new ArrayList<>();
        List<LocalTime[]> blocks = new ArrayList<>();

        for (var a : allocated) {
            LocalTime s = LocalTime.parse(a.getStartTime());
            LocalTime e = LocalTime.parse(a.getEndTime());

            LocalTime ss = s.isBefore(WIN_START) ? WIN_START : s;
            LocalTime ee = e.isAfter(WIN_END) ? WIN_END : e;
            if (ee.isAfter(ss)) blocks.add(new LocalTime[]{ss, ee});
        }

        blocks.sort(Comparator.comparing(b -> b[0]));

        LocalTime cursor = WIN_START;
        for (var b : blocks) {
            if (b[0].isAfter(cursor)) {
                unallocated.add(new UnallocatedItemDto(cursor.toString(), b[0].toString(), "Unallocated"));
            }
            if (b[1].isAfter(cursor)) cursor = b[1];
        }
        if (cursor.isBefore(WIN_END)) {
            unallocated.add(new UnallocatedItemDto(cursor.toString(), WIN_END.toString(), "Unallocated"));
        }

        return new DayViewDto(date.toString(), window, allocated, unallocated);
    }

    /** 详情页右上角“+”菜单依赖的数据 */
    public ShiftDetailsDto shiftDetails(String email, Long uid, long shiftId) {
        Long me = resolveStaffId(email, uid);
        if (me == null) throw new RuntimeException("NO_STAFF");

        String headSql = """
            SELECT DATE(s.start_ts)                           AS d,
                   s.id                                       AS sid,
                   s.start_ts                                  AS st_ts,
                   s.end_ts                                    AS et_ts,
                   TIMESTAMPDIFF(MINUTE, s.start_ts, s.end_ts) AS dur,
                   l.name                                      AS campus,
                   (SELECT dz.name FROM designation dz
                      JOIN staff st2 ON st2.designation_id = dz.id
                     WHERE st2.id = ?)                         AS designation
              FROM shift s
              JOIN shift_assignment sa ON sa.shift_id = s.id AND sa.staff_id = ?
              LEFT JOIN location l ON l.id = s.location_id
             WHERE s.id = ?
        """;

        record Head(String date, long sid, LocalDateTime st, LocalDateTime et,
                    int dur, String campus, String designation) {}

        Head h;
        try {
            h = jdbc.queryForObject(headSql, (rs, i) -> new Head(
                    rs.getString("d"),
                    rs.getLong("sid"),
                    rs.getTimestamp("st_ts").toLocalDateTime(),
                    rs.getTimestamp("et_ts").toLocalDateTime(),
                    rs.getInt("dur"),
                    rs.getString("campus"),
                    rs.getString("designation")
            ), me, me, shiftId);
        } catch (EmptyResultDataAccessException e) {
            throw new RuntimeException("SHIFT_NOT_FOUND_OR_NOT_OWNED");
        }

        String cowSql = """
            SELECT st.id AS staffId,
                   CONCAT(COALESCE(st.first_name,''), ' ', COALESCE(st.last_name,'')) AS staffName,
                   CONCAT(UPPER(LEFT(COALESCE(st.first_name,''),1)),
                          UPPER(LEFT(COALESCE(st.last_name,''),1))) AS staffInitials
              FROM shift_assignment sa
              JOIN staff st ON st.id = sa.staff_id
             WHERE sa.shift_id = ?
               AND sa.staff_id <> ?
             ORDER BY st.last_name, st.first_name
        """;

        List<CoworkerDto> coworkers = jdbc.query(cowSql,
                (rs, i) -> new CoworkerDto(
                        rs.getLong("staffId"),
                        rs.getString("staffName").trim(),
                        rs.getString("staffInitials")
                ),
                shiftId, me
        );

        return new ShiftDetailsDto(
                h.date(),
                h.sid(),
                h.st().format(HM),
                h.et().format(HM),
                h.dur(),
                new LocationDto(h.campus(), null, null),
                h.designation(),
                coworkers
        );
    }
}
