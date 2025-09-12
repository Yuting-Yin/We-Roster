package com.weroster.service;

import com.weroster.Dto.ShiftSwapDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class ShiftSwapService {
    private final JdbcTemplate jdbc;

    public ShiftSwapService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<ShiftSwapDto> list() {
        String sql = "SELECT id, from_time, to_time, date_made FROM shift_swap ORDER BY id DESC";
        return jdbc.query(sql, (rs, i) -> new ShiftSwapDto(
                rs.getLong("id"),
                toInstant(rs.getTimestamp("from_time")),
                toInstant(rs.getTimestamp("to_time")),
                toInstant(rs.getTimestamp("date_made"))
        ));
    }

    private static Instant toInstant(Timestamp ts) {
        return ts == null ? null : ts.toInstant();
    }
}
