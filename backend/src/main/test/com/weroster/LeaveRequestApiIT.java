package com.weroster;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.Order;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.containers.MySQLContainer;

import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.MOCK,
        properties = {
                "spring.jpa.hibernate.ddl-auto=create-drop",
                "spring.datasource.type=com.zaxxer.hikari.HikariDataSource",
                "spring.sql.init.mode=never"
        }
)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Testcontainers
@TestPropertySource(properties = {
        "security.jwt.secret=unit-test-secret-please-change",
        "security.jwt.issuer=weRoster-it",
        "security.jwt.access-token-minutes=60"
})

@Sql(
        statements = {
                "DROP TABLE IF EXISTS leave_request",
                "DROP TABLE IF EXISTS staff",

                "CREATE TABLE staff (" +
                        "  id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                        "  email VARCHAR(255) NOT NULL UNIQUE" +
                        ")",

                "CREATE TABLE leave_request (" +
                        "  id BIGINT PRIMARY KEY AUTO_INCREMENT," +
                        "  staff_id BIGINT NOT NULL," +
                        "  shift_id BIGINT NOT NULL," +
                        "  leave_type VARCHAR(32) NOT NULL," +
                        "  all_day TINYINT(1) NOT NULL," +
                        "  start_time VARCHAR(32)," +
                        "  end_time   VARCHAR(32)," +
                        "  CONSTRAINT fk_leave_staff FOREIGN KEY (staff_id) REFERENCES staff(id)" +
                        ")",

                "INSERT INTO staff(id, email) VALUES (1, 'alice@example.com')"
        },
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD
)



class LeaveRequestApiIT {

    static final MySQLContainer<?> MYSQL =
            new MySQLContainer<>("mysql:8.0.33")
                    .withDatabaseName("weroster_it")
                    .withUsername("test")
                    .withPassword("test");

    static {
        MYSQL.start();
    }
    @DynamicPropertySource
    static void mysqlProps(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", MYSQL::getJdbcUrl);
        r.add("spring.datasource.username", MYSQL::getUsername);
        r.add("spring.datasource.password", MYSQL::getPassword);
        r.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
    }

    @Autowired
    MockMvc mvc;


    private static final String BASE = "/api/v1/myroster";


    @Test
    @Order(1)
    @DisplayName("IT-001: POST /leave-request → 201/200")
    @WithMockUser(username = "alice@example.com")
    void createLeave_persisted() throws Exception {
        String createJson = """
            {
              "shiftId": 1001,
              "leaveType": "SICK",
              "allDay": false,
              "date": "2025-09-22",
              "startTime": "09:00",
              "endTime": "12:00"
            }
        """;

        mvc.perform(post(BASE + "/leave-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createJson))
                .andExpect(status().isOk()) // 或 isCreated()，按你的实现
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.shiftId").value(1001))
                .andExpect(jsonPath("$.leaveType").value("SICK"))
                .andExpect(jsonPath("$.allDay").value(false))
                .andExpect(jsonPath("$.date").value("2025-09-22"))
                .andExpect(jsonPath("$.startTime").value("09:00"))
                .andExpect(jsonPath("$.endTime").value("12:00"));


        mvc.perform(get(BASE + "/shift/{sid}/leave-request", 1001))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.shiftId").value(1001))
                .andExpect(jsonPath("$.leaveType").value("SICK"))
                .andExpect(jsonPath("$.allDay").value(false))
                .andExpect(jsonPath("$.date").value("2025-09-22"))
                .andExpect(jsonPath("$.startTime").value("09:00"))
                .andExpect(jsonPath("$.endTime").value("12:00"));
    }


    @Test
    @Order(2)
    @DisplayName("IT-002: same shift create again, overwrite/update）")
    @WithMockUser(username = "alice@example.com")
    void overwriteLeave_persistUpdated() throws Exception {
        String overwriteJson = """
        {
          "shiftId": 1001,
          "leaveType": "SICK",
          "allDay": false,
          "date": "2025-09-22",
          "startTime": "10:00",
          "endTime": "13:30"
        }
    """;

        mvc.perform(post(BASE + "/leave-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(overwriteJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shiftId").value(1001))
                .andExpect(jsonPath("$.startTime").value("10:00"))
                .andExpect(jsonPath("$.endTime").value("13:30"));

        mvc.perform(get(BASE + "/shift/{sid}/leave-request", 1001))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shiftId").value(1001))
                .andExpect(jsonPath("$.startTime").value("10:00"))
                .andExpect(jsonPath("$.endTime").value("13:30"));
    }


    @Test
    @Order(3)
    @DisplayName("IT-003: Get shifts that do not exist (200)")
    @WithMockUser(username = "alice@example.com")
    void getAbsent_okButEmpty() throws Exception {
        mvc.perform(get(BASE + "/shift/{sid}/leave-request", 777777))
                .andExpect(status().isOk());

    }
}
