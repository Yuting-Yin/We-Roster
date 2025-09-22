package com.weroster.service;
import com.weroster.Dto.*;
import org.springframework.context.annotation.Primary;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import com.weroster.Dto.AllocatedItemDto;
import com.weroster.Dto.DayViewDto;
import com.weroster.Dto.DayWindowDto;
import com.weroster.Dto.UnallocatedItemDto;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@Primary // 避免注入到旧的 service
public class MyRosterService {
    private final DateTimeFormatter HM = DateTimeFormatter.ofPattern("HH:mm");

    private final JdbcTemplate jdbc;
    public MyRosterService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    // 复用你之前的“用户→职员”关联逻辑：优先 user_staff，再回退 email
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

    /**
     * MyRoster 主界面：给定 date（YYYY-MM-DD），返回当天时间轴上的班次列表
     */
    public DayRosterDto day(String email, Long uid, java.time.LocalDate date) {
        Long staffId = resolveStaffId(email, uid);
        if (staffId == null) {
            return new DayRosterDto(date.toString(), java.util.List.of());
        }

        // 用参数传具体的起止时间，避免 TIMESTAMP(date,'..') 的方言差异
        java.time.LocalDateTime startOfDay = date.atStartOfDay();
        java.time.LocalDateTime endOfDay   = date.atTime(23, 59, 59);

        String sql = """
        SELECT
          s.id,
          s.start_ts       AS startTs,
          s.end_ts         AS endTs,
          d.name           AS dept,
          l.name           AS location,
          s.code           AS code,
          COALESCE(sa.is_lead, 0) AS isLead,
          GREATEST( (SELECT COUNT(*) FROM shift_assignment x WHERE x.shift_id = s.id) - 1, 0) AS coworkers
        FROM shift s
        JOIN shift_assignment sa ON sa.shift_id = s.id AND sa.staff_id = ?
        LEFT JOIN dept d      ON d.id = s.dept_id
        LEFT JOIN location l  ON l.id = s.location_id
        WHERE s.start_ts < ?    -- endOfDay
          AND s.end_ts   > ?    -- startOfDay
        ORDER BY s.start_ts
        """;

        List<ShiftItemDto> items = jdbc.query(sql, (rs, i) -> {
            var tsStart = rs.getTimestamp("startTs"); // 别直接 toLocalDateTime
            var tsEnd   = rs.getTimestamp("endTs");
            String startIso = tsStart != null ? tsStart.toLocalDateTime().toString() : null;
            String endIso   = tsEnd   != null ? tsEnd.toLocalDateTime().toString()   : null;
            return new ShiftItemDto(
                    rs.getLong("id"),
                    startIso, endIso,
                    rs.getString("dept"),
                    rs.getString("location"),
                    rs.getString("code"),
                    rs.getBoolean("isLead"),
                    rs.getInt("coworkers")
            );
        }, staffId, Timestamp.valueOf(endOfDay), Timestamp.valueOf(startOfDay));

        return new DayRosterDto(date.toString(), items);
    }
    public DayViewDto dayView(String email, Long uid, LocalDate date) {
        Long staffId = resolveStaffId(email, uid);
        // 日窗：按产品定义，AM 8:00 ~ PM 23:59
        LocalTime WIN_START = LocalTime.of(8, 0);
        LocalTime WIN_END   = LocalTime.of(23, 59);
        var window = new DayWindowDto(WIN_START.toString(), WIN_END.toString());

        if (staffId == null) {
            return new DayViewDto(
                    date.toString(), window,
                    java.util.List.of(),
                    java.util.List.of(new UnallocatedItemDto(
                            WIN_START.toString(), WIN_END.toString(), "Unallocated"))
            );
        }

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd   = date.atTime(23, 59, 59);

        String sql = """
          SELECT
            s.id  AS sid,
            s.start_ts AS startTs,
            s.end_ts   AS endTs,
            l.id       AS loc_id,
            l.name     AS loc_name,
            l.code     AS loc_code,
            l.type     AS loc_type,
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
                    var start = rs.getTimestamp("startTs").toLocalDateTime();
                    var end   = rs.getTimestamp("endTs").toLocalDateTime();

                    String shiftId = "sh_" + rs.getLong("sid");
                    String startHHmm = start.toLocalTime().toString().substring(0,5); // "HH:mm"
                    String endHHmm   = end.toLocalTime().toString().substring(0,5);

                    var campus = new CampusDto(
                            "camp_" + rs.getLong("loc_id"),
                            rs.getString("loc_name")
                    );
                    // May have issues
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
                }, staffId, staffId,
                java.sql.Timestamp.valueOf(dayEnd),
                java.sql.Timestamp.valueOf(dayStart));

        // 计算未分配时段：在 [08:00,23:59] 窗口中，用 allocated 的 (start,end) 做差集
        List<UnallocatedItemDto> unallocated = new ArrayList<>();
        // 把已分配时段裁剪到窗口内，并按开始时间排序
        List<java.time.LocalTime[]> blocks = new ArrayList<>();
        for (var a : allocated) {
            var s = java.time.LocalTime.parse(a.getStartTime());
            var e = java.time.LocalTime.parse(a.getEndTime());
            var ss = s.isBefore(WIN_START) ? WIN_START : s;
            var ee = e.isAfter(WIN_END) ? WIN_END : e;
            if (ee.isAfter(ss)) blocks.add(new java.time.LocalTime[]{ss, ee});
        }
        blocks.sort(java.util.Comparator.comparing(b -> b[0]));

        var cursor = WIN_START;
        for (var b : blocks) {
            if (b[0].isAfter(cursor)) {
                unallocated.add(new UnallocatedItemDto(
                        cursor.toString(), b[0].toString(), "Unallocated"));
            }
            if (b[1].isAfter(cursor)) cursor = b[1];
        }
        if (cursor.isBefore(WIN_END)) {
            unallocated.add(new UnallocatedItemDto(
                    cursor.toString(), WIN_END.toString(), "Unallocated"));
        }

        return new DayViewDto(
                date.toString(), window, allocated, unallocated
        );
    }
    public ShiftDetailsDto shiftDetails(String email, Long uid, long shiftId) {
        Long me = resolveStaffId(email, uid);
        if (me == null) throw new RuntimeException("NO_STAFF");

        // 头部信息：日期、起止时间、时长、地点、我的岗位名称
        var headSql = """
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
            // 不属于我的班/不存在
            throw new RuntimeException("SHIFT_NOT_FOUND_OR_NOT_OWNED");
        }

        // 同班的同事（不含我）
        var cowSql = """
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
                new LocationDto(h.campus(), null, null), // 你的表无 address/room → null
                h.designation(),
                coworkers
        );
    }
}
