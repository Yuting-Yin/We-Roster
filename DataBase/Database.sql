CREATE TABLE Hospital(
                         Id BIGINT AUTO_INCREMENT PRIMARY KEY ,
                         Name VARCHAR(300) NOT NULL,
                         Code VARCHAR(60) UNIQUE,
                         Address VARCHAR(1000),
                         Note TEXT
) ENGINE = InnoDB;

CREATE TABLE Users(
                      Id BIGINT AUTO_INCREMENT PRIMARY KEY,
                      domain VARCHAR(100) NOT NULL,
                      role VARCHAR(32) NOT NULL,
                      email VARCHAR(320) NOT NULL,
                      salt VARCHAR(255),
                      password_hash VARCHAR(255) NOT NULL,
                      status VARCHAR(30) NOT NULL,
                      created_time DATETIME,
                      status_time DATETIME NULL,
                      last_login_time DATETIME NULL,
                      login_attempts INT NOT NULL DEFAULT 0,
                      UNIQUE KEY unique_domain_email (domain, email)
) ENGINE = InnoDB;

CREATE TABLE designation(
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(300) NOT NULL,
                            code VARCHAR(60),
                            matrix VARCHAR(60),
                            type VARCHAR(60),
                            status VARCHAR(60) NOT NULL DEFAULT 'ACTIVE',
                            status_time DATETIME,
                            accreditation VARCHAR(200),
                            note TEXT,
                            created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE staff(
                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                      hospital_id BIGINT NOT NULL,
                      designation_id BIGINT NULL,
                      user_id BIGINT NULL,
                      first_name VARCHAR(100) NOT NULL,
                      last_name VARCHAR(100) NOT NULL,
                      gender VARCHAR(16),
                      date_of_birth DATE,
                      hire_date DATE,
                      leave_date DATE,
                      email VARCHAR(300),
                      phone VARCHAR(32),
                      is_manager BOOLEAN NOT NULL DEFAULT FALSE,
                      type VARCHAR(50),
                      matrix VARCHAR(50),
                      accreditation VARCHAR(200),
                      status VARCHAR(30) NOT NULL DEFAULT 'Active',
                      status_time DATETIME,
                      note TEXT,
                      created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      CONSTRAINT fk_staff_hospital FOREIGN KEY (hospital_id) REFERENCES Hospital(id),
                      CONSTRAINT fk_staff_designation FOREIGN KEY (designation_id) REFERENCES designation(id),
                      CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES Users(id),
                      UNIQUE KEY unique_staff_user (user_id)
) ENGINE = InnoDB;

CREATE TABLE dept(
                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                     parent_id BIGINT NULL,
                     hospital_id BIGINT NOT NULL,
                     name VARCHAR(300) NOT NULL,
                     code VARCHAR(60) UNIQUE,
                     note TEXT,
                     CONSTRAINT fk_dept_hospital FOREIGN KEY (hospital_id) REFERENCES Hospital(id),
                     CONSTRAINT fk_dept_parent FOREIGN KEY (parent_id) REFERENCES dept(id)
) ENGINE=InnoDB;

CREATE TABLE staff_department(
                                 staff_id BIGINT NOT NULL,
                                 dept_id BIGINT NOT NULL,
                                 is_primary BOOLEAN NOT NULL DEFAULT FALSE,
                                 assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 PRIMARY KEY (staff_id, dept_id),
                                 CONSTRAINT fk_sd_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
                                 CONSTRAINT fk_sd_dept  FOREIGN KEY (dept_id)  REFERENCES dept(id)  ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE location (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(200) NOT NULL,
                          code VARCHAR(50) UNIQUE,
                          hospital_id BIGINT NOT NULL,
                          parent_id    BIGINT NULL,
                          note TEXT,
                          type VARCHAR(50),
                          CONSTRAINT fk_loc_parent FOREIGN KEY (parent_id)   REFERENCES location(id),
                          CONSTRAINT fk_loc_hospital  FOREIGN KEY (hospital_id) REFERENCES Hospital(id)
) ENGINE=InnoDB;

CREATE TABLE shift (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       start_ts DATETIME NOT NULL,
                       end_ts DATETIME NOT NULL,
                       dept_id BIGINT NULL,
                       location_id BIGINT NULL,
                       type VARCHAR(50),
                       name VARCHAR(200),
                       note TEXT,
                       status VARCHAR(30) NOT NULL DEFAULT 'COMPLETE',
                       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       CONSTRAINT fk_shift_dept FOREIGN KEY (dept_id) REFERENCES dept(id),
                       CONSTRAINT fk_shift_location FOREIGN KEY (location_id) REFERENCES location(id),
                       CONSTRAINT chk_shift_time CHECK (end_ts > start_ts),
                       CONSTRAINT chk_shift_status CHECK (status IN ('COMPLETE', 'INCOMPLETE'))
) ENGINE=InnoDB;


-- roster_template tables removed - not used in current implementation

CREATE TABLE shift_assignment (
                                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                  staff_id BIGINT NOT NULL,
                                  shift_id BIGINT NOT NULL,
                                  is_lead BOOLEAN NOT NULL DEFAULT FALSE,
                                  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  assigned_by BIGINT NULL,
                                  status VARCHAR(30) DEFAULT 'ACTIVE',
                                  note TEXT,
                                  UNIQUE KEY uq_shift_staff (shift_id, staff_id),
                                  CONSTRAINT fk_staff_sa FOREIGN KEY (staff_id) REFERENCES staff(id)  ON DELETE CASCADE,
                                  CONSTRAINT fk_shift_sa FOREIGN KEY (shift_id) REFERENCES shift(id)  ON DELETE CASCADE,
                                  CONSTRAINT fk_assigned_by FOREIGN KEY (assigned_by) REFERENCES staff(id),
                                  CONSTRAINT chk_assignment_status CHECK (status IN ('ACTIVE', 'WITHDRAWN', 'CANCELLED'))
) ENGINE=InnoDB;

CREATE TABLE leave_request(
                              id BIGINT AUTO_INCREMENT PRIMARY KEY,
                              start_time DATETIME,
                              end_time DATETIME,
                              staff_id BIGINT,
                              shift_id BIGINT NULL,
                              request_type VARCHAR(50),
                              reason TEXT,
                              status VARCHAR(30) DEFAULT 'PENDING',
                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                              approved_at DATETIME NULL,
                              approved_by BIGINT NULL,
                              CONSTRAINT fk_leave_staff FOREIGN KEY (staff_id) REFERENCES staff(id),
                              CONSTRAINT fk_leave_shift FOREIGN KEY (shift_id) REFERENCES shift(id),
                              CONSTRAINT fk_leave_approved_by FOREIGN KEY (approved_by) REFERENCES staff(id)
) ENGINE = InnoDB;

CREATE TABLE shift_swap(
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           from_time DATETIME NOT NULL,
                           to_time DATETIME NOT NULL,
                           date_made DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           requester_id BIGINT,
                           target_id BIGINT,
                           message TEXT,
                           status VARCHAR(30) DEFAULT 'PENDING',
                           CONSTRAINT fk_swap_requester FOREIGN KEY (requester_id) REFERENCES staff(id),
                           CONSTRAINT fk_swap_target FOREIGN KEY (target_id) REFERENCES staff(id)
) ENGINE = InnoDB;

CREATE TABLE open_shift(
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           shift_id BIGINT NOT NULL,
                           urgent_flag TINYINT(1) NULL,
                           extra_pay_cents INT NULL,
                           status VARCHAR(30) DEFAULT 'AVAILABLE',
                           created_by BIGINT NULL,
                           total_staff_needed INT NOT NULL DEFAULT 1,
                           created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           CONSTRAINT fk_open_shift_shift FOREIGN KEY (shift_id) REFERENCES shift(id) ON DELETE CASCADE,
                           CONSTRAINT fk_open_shift_created_by FOREIGN KEY (created_by) REFERENCES staff(id),
                           CONSTRAINT chk_open_shift_status CHECK (status IN ('AVAILABLE', 'READY_TO_RUN', 'APPROVED_FOR_FORMAL', 'CANCELLED'))
) ENGINE = InnoDB;

CREATE TABLE shift_designation_requirements (
                                                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                      shift_id BIGINT NOT NULL,
                                                      designation_id BIGINT NOT NULL,
                                                      required_count INT NOT NULL DEFAULT 1,
                                                      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                                      CONSTRAINT fk_sdr_shift FOREIGN KEY (shift_id) REFERENCES shift(id) ON DELETE CASCADE,
                                                      CONSTRAINT fk_sdr_designation FOREIGN KEY (designation_id) REFERENCES designation(id)
) ENGINE = InnoDB;

CREATE TABLE open_shift_request (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     open_shift_id BIGINT NOT NULL,
                                     staff_id BIGINT NOT NULL,
                                     message TEXT,
                                     status VARCHAR(30) DEFAULT 'PENDING',
                                     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     reviewed_by BIGINT NULL,
                                     reviewed_at DATETIME NULL,
                                     review_notes TEXT,
                                     CONSTRAINT fk_osr_open_shift FOREIGN KEY (open_shift_id) REFERENCES open_shift(id) ON DELETE CASCADE,
                                     CONSTRAINT fk_osr_staff FOREIGN KEY (staff_id) REFERENCES staff(id),
                                     CONSTRAINT fk_osr_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES staff(id),
                                     CONSTRAINT chk_osr_status CHECK (status IN ('PENDING', 'APPROVED', 'DECLINED', 'WITHDRAWN')),
                                     UNIQUE KEY uq_open_shift_staff (open_shift_id, staff_id)
) ENGINE = InnoDB;


CREATE TABLE notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'EVENT_ASSIGNMENT', 'LEAVE_APPROVAL', 'LEAVE_DECLINED', 'SWAP_REQUEST', 'SWAP_APPROVED', 'SWAP_DECLINED', 'OPEN_SHIFT_APPROVED', 'OPEN_SHIFT_DECLINED', 'LEAVE_SWAP_REQUEST'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME NULL,
    
    -- Optional: Reference to the related entity
    related_entity_type VARCHAR(50) NULL, -- 'shift_assignment', 'leave_request', 'shift_swap', 'open_shift_request', etc.
    related_entity_id BIGINT NULL,
    
    -- Optional: Who triggered this notification
    triggered_by_id BIGINT NULL,
    
    CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_triggered_by FOREIGN KEY (triggered_by_id) REFERENCES Users(id),
    INDEX idx_notification_recipient_read (recipient_id, is_read),
    INDEX idx_notification_created_at (created_at)
) ENGINE = InnoDB;

-- Database schema for WeRoster application
-- All data population is handled by DataInitializer.java

-- Schema cleanup completed:
-- - Removed obsolete user_staff table (using direct @OneToOne relationship)
-- - Removed unused roster_template tables
-- - Removed redundant test data (DataInitializer.java handles all data)
-- - Added user_id foreign key to staff table
-- - Added missing columns to open_shift table
-- - Added notification table for user notifications

