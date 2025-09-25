package com.weroster;

import com.weroster.Dto.CreateLeaveRequestCommand;
import com.weroster.Dto.LeaveRequestDto;
import com.weroster.controller.LeaveRequestController;
import com.weroster.service.LeaveRequestService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = LeaveRequestController.class,
        excludeFilters = {
                @Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.weroster.config.SecurityConfig.class),
                @Filter(type = FilterType.ASSIGNABLE_TYPE, classes = com.weroster.security.JwtAuthFilter.class)
        },
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
        }
)
@AutoConfigureMockMvc(addFilters = false)
class LeaveRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LeaveRequestService leaveRequestService;

    private static final String BASE = "/api/v1/myroster";

    // ===== TC-Leave-001 — Create leave (partial-day) =====
    @Test
    @DisplayName("TC-Leave-001: POST /myroster/leave-request — partial-day create → 200 + body")
    @WithMockUser(username = "alice@example.com")
    void create_partial_ok() throws Exception {
        LeaveRequestDto dto = new LeaveRequestDto(
                101L, "SICK", false,
                "2025-09-22", "09:00", "12:00"
        );

        when(leaveRequestService.createOrUpdate(
                eq("alice@example.com"),
                ArgumentMatchers.<Long>isNull(),
                any(CreateLeaveRequestCommand.class)
        )).thenReturn(dto);

        String body = """
        {
          "shiftId": 101,
          "leaveType": "SICK",
          "allDay": false,
          "date": "2025-09-22",
          "startTime": "09:00",
          "endTime": "12:00"
        }
        """;

        mockMvc.perform(post(BASE + "/leave-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.shiftId").value(101))
                .andExpect(jsonPath("$.leaveType").value("SICK"))
                .andExpect(jsonPath("$.allDay").value(false))
                .andExpect(jsonPath("$.date").value("2025-09-22"))
                .andExpect(jsonPath("$.startTime").value("09:00"))
                .andExpect(jsonPath("$.endTime").value("12:00"));

        verify(leaveRequestService, times(1))
                .createOrUpdate(eq("alice@example.com"), ArgumentMatchers.<Long>isNull(),
                        any(CreateLeaveRequestCommand.class));
    }

    // ===== TC-Leave-002 — Create leave (full-day) =====
    @Test
    @DisplayName("TC-Leave-002: POST /myroster/leave-request — full-day create → 200 + body")
    @WithMockUser(username = "alice@example.com")
    void create_fullday_ok() throws Exception {
        LeaveRequestDto dto = new LeaveRequestDto(
                102L, "ANNUAL", true,
                "2025-09-23", "00:00", "23:59"
        );

        when(leaveRequestService.createOrUpdate(
                eq("alice@example.com"),
                ArgumentMatchers.<Long>isNull(),
                any(CreateLeaveRequestCommand.class)
        )).thenReturn(dto);

        String body = """
        {
          "shiftId": 102,
          "leaveType": "ANNUAL",
          "allDay": true,
          "date": "2025-09-23",
          "startTime": "00:00",
          "endTime": "23:59"
        }
        """;

        mockMvc.perform(post(BASE + "/leave-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.shiftId").value(102))
                .andExpect(jsonPath("$.leaveType").value("ANNUAL"))
                .andExpect(jsonPath("$.allDay").value(true))
                .andExpect(jsonPath("$.date").value("2025-09-23"))
                .andExpect(jsonPath("$.startTime").value("00:00"))
                .andExpect(jsonPath("$.endTime").value("23:59"));

        verify(leaveRequestService, times(1))
                .createOrUpdate(eq("alice@example.com"), ArgumentMatchers.<Long>isNull(),
                        any(CreateLeaveRequestCommand.class));
    }

    // ===== TC-Leave-003 — Get my leave (no record) =====
    @Test
    @DisplayName("TC-Leave-003: GET /myroster/shift/{id}/leave-request — no record → 200")
    @WithMockUser(username = "alice@example.com")
    void getMine_none_ok() throws Exception {
        when(leaveRequestService.getMine(eq("alice@example.com"),
                ArgumentMatchers.<Long>isNull(), eq(777L))).thenReturn(null);

        mockMvc.perform(get(BASE + "/shift/{sid}/leave-request", 777L))
                .andExpect(status().isOk());

        verify(leaveRequestService, times(1))
                .getMine(eq("alice@example.com"), ArgumentMatchers.<Long>isNull(), eq(777L));
    }

    // ===== TC-Leave-004 — Create leave with existing record (overwrite allowed) =====
    @Test
    @DisplayName("TC-Leave-004: POST /myroster/leave-request — overwrite existing → 200")
    @WithMockUser(username = "alice@example.com")
    void createOrUpdate_overwrite_ok() throws Exception {
        LeaveRequestDto dto = new LeaveRequestDto(
                42L, "SICK", false,
                "2025-09-22", "09:00", "12:00"
        );

        when(leaveRequestService.createOrUpdate(
                eq("alice@example.com"),
                ArgumentMatchers.<Long>isNull(),
                any(CreateLeaveRequestCommand.class)
        )).thenReturn(dto);

        String body = """
        {
          "shiftId": 42,
          "leaveType": "SICK",
          "allDay": false,
          "date": "2025-09-22",
          "startTime": "09:00",
          "endTime": "12:00"
        }
        """;

        mockMvc.perform(post(BASE + "/leave-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.shiftId").value(42))
                .andExpect(jsonPath("$.leaveType").value("SICK"))
                .andExpect(jsonPath("$.allDay").value(false))
                .andExpect(jsonPath("$.date").value("2025-09-22"))
                .andExpect(jsonPath("$.startTime").value("09:00"))
                .andExpect(jsonPath("$.endTime").value("12:00"));

        verify(leaveRequestService, times(1))
                .createOrUpdate(eq("alice@example.com"), ArgumentMatchers.<Long>isNull(),
                        any(CreateLeaveRequestCommand.class));
    }

    // ===== TC-Leave-005 — Create leave conflict (reject) =====
    @Test
    @DisplayName("TC-Leave-005: POST /myroster/leave-request — conflict → 409")
    @WithMockUser(username = "alice@example.com")
    void createOrUpdate_conflict_409() throws Exception {
        when(leaveRequestService.createOrUpdate(
                eq("alice@example.com"),
                ArgumentMatchers.<Long>isNull(),
                any(CreateLeaveRequestCommand.class)
        )).thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Leave already exists for shift"));

        String body = """
        {
          "shiftId": 42,
          "leaveType": "SICK",
          "allDay": false,
          "date": "2025-09-22",
          "startTime": "09:00",
          "endTime": "12:00"
        }
        """;

        mockMvc.perform(post(BASE + "/leave-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());

        verify(leaveRequestService, times(1))
                .createOrUpdate(eq("alice@example.com"), ArgumentMatchers.<Long>isNull(),
                        any(CreateLeaveRequestCommand.class));
    }

    // ===== TC-Leave-006 — Access control: self-only (forbidden) =====
    @Test
    @DisplayName("TC-Leave-006: GET /myroster/shift/{id}/leave-request — forbidden → 403")
    @WithMockUser(username = "bob@example.com")
    void getMine_forbidden_403() throws Exception {
        when(leaveRequestService.getMine(eq("bob@example.com"),
                ArgumentMatchers.<Long>isNull(), eq(555L)))
                .thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden"));

        mockMvc.perform(get(BASE + "/shift/{sid}/leave-request", 555L))
                .andExpect(status().isForbidden());

        verify(leaveRequestService, times(1))
                .getMine(eq("bob@example.com"), ArgumentMatchers.<Long>isNull(), eq(555L));
    }

    // ===== TC-Leave-007 — Get my leave (record exists) =====
    @Test
    @DisplayName("TC-Leave-007: GET /myroster/shift/{id}/leave-request — found → 200 + body")
    @WithMockUser(username = "alice@example.com")
    void getMine_found_ok() throws Exception {
        LeaveRequestDto dto = new LeaveRequestDto(
                99L, "ANNUAL", true,
                "2025-09-23", "00:00", "23:59"
        );

        when(leaveRequestService.getMine(eq("alice@example.com"),
                ArgumentMatchers.<Long>isNull(), eq(99L))).thenReturn(dto);

        mockMvc.perform(get(BASE + "/shift/{sid}/leave-request", 99L))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.shiftId").value(99))
                .andExpect(jsonPath("$.leaveType").value("ANNUAL"))
                .andExpect(jsonPath("$.allDay").value(true))
                .andExpect(jsonPath("$.date").value("2025-09-23"))
                .andExpect(jsonPath("$.startTime").value("00:00"))
                .andExpect(jsonPath("$.endTime").value("23:59"));

        verify(leaveRequestService, times(1))
                .getMine(eq("alice@example.com"), ArgumentMatchers.<Long>isNull(), eq(99L));
    }
}
