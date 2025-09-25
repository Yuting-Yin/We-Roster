CREATE TABLE Hospital(
                         Id BIGINT AUTO_INCREMENT PRIMARY KEY ,
                         Name VARCHAR(300) NOT NULL,
                         Code VARCHAR(60) UNIQUE,
                         Address VARCHAR(1000),
                         Note TEXT
) ENGINE = InnoDB;

CREATE TABLE Users(
                      Id BIGINT AUTO_INCREMENT PRIMARY KEY,
                      role VARCHAR(32) NOT NULL,
                      email VARCHAR(320) UNIQUE,
                      salt VARCHAR(255),
                      password_hash VARCHAR(255) NOT NULL,
                      status VARCHAR(30) NOT NULL,
                      created_time DATETIME,
                      status_time DATETIME NULL,
                      last_login_time DATETIME NULL,
                      login_attempts INT NOT NULL DEFAULT 0
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
                      status VARCHAR(30) NOT NULL DEFAULT 'Active',
                      status_time DATETIME,
                      note TEXT,
                      created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      CONSTRAINT fk_staff_hospital FOREIGN KEY (hospital_id) REFERENCES Hospital(id),
                      CONSTRAINT fk_staff_designation FOREIGN KEY (designation_id) REFERENCES designation(id)
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
                       code VARCHAR(50),
                       note TEXT,
                       CONSTRAINT fk_shift_dept FOREIGN KEY (dept_id) REFERENCES dept(id),
                       CONSTRAINT fk_shift_location FOREIGN KEY (location_id) REFERENCES location(id),
                       CONSTRAINT chk_shift_time CHECK (end_ts > start_ts)
) ENGINE=InnoDB;


CREATE TABLE roster_template (
                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                 status VARCHAR(20) DEFAULT 'ACTIVE',
                                 name VARCHAR(120) NOT NULL,
                                 code VARCHAR(50),
                                 created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 note TEXT
) ENGINE=InnoDB;

CREATE TABLE roster_template_shift (
                                       shift_id    BIGINT NOT NULL,
                                       template_id BIGINT NOT NULL,
                                       PRIMARY KEY (template_id, shift_id),
                                       CONSTRAINT fk_template_rts FOREIGN KEY (template_id) REFERENCES roster_template(id) ON DELETE CASCADE,
                                       CONSTRAINT fk_shift_rts    FOREIGN KEY (shift_id)    REFERENCES shift(id)           ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE shift_assignment (
                                  id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                  staff_id BIGINT NOT NULL,
                                  shift_id BIGINT NOT NULL,
                                  is_lead BOOLEAN NOT NULL DEFAULT FALSE,
                                  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  note TEXT,
                                  UNIQUE KEY uq_shift_staff (shift_id, staff_id),
                                  CONSTRAINT fk_staff_sa FOREIGN KEY (staff_id) REFERENCES staff(id)  ON DELETE CASCADE,
                                  CONSTRAINT fk_shift_sa FOREIGN KEY (shift_id) REFERENCES shift(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE leave_request(
                              ID BIGINT AUTO_INCREMENT PRIMARY KEY,
                              start_time DATETIME,
                              end_time DATETIME
) ENGINE = InnoDB;

CREATE TABLE shift_swap(
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           from_time DATETIME NOT NULL,
                           to_time DATETIME NOT NULL,
                           date_made DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE open_shift(
                           shift_id BIGINT PRIMARY KEY,
                           date_made DATETIME NOT NULL
) ENGINE = InnoDB;

USE weroster;  -- or your actual schema

SET @email := 'admin@weroster.local';
SET @plain := 'ChangeMe123!';

-- If you “use md5 for salt”, make one (32-hex chars)
SET @salt := MD5(UUID());      -- e.g., "c3a1..."; any string works as long as you store it

INSERT INTO Users (email, salt, password_hash, role, status, created_time)
VALUES (LOWER(@email), @salt, MD5(CONCAT(@salt, @plain)), 'ADMIN', 'ACTIVE', NOW());

-- sanity check: should be 1
SELECT MD5(CONCAT(salt, @plain)) = password_hash AS ok
FROM Users WHERE email=@email;

-- In MySQL (the schema your app uses)
USE weroster;  -- or your actual DB

-- Leave
INSERT INTO leave_request (start_time, end_time)
VALUES ('2025-10-02 00:00:00', '2025-10-08 00:00:00');

-- Shift swap
INSERT INTO shift_swap (from_time, to_time, date_made)
VALUES ('2025-09-05 08:00:00', '2025-09-05 16:00:00', NOW());

INSERT INTO staff (hospital_id, first_name, last_name, email, status)
VALUES (1, 'Admin', 'User', 'admin@weroster.local', 'Active');

START TRANSACTION;

-- 1) brand-new hospital/designation/department (unique codes)
INSERT INTO Hospital (name, code, address)
VALUES ('Test Hospital', 'WRG1', '123 Test St');
SET @hosp_id := LAST_INSERT_ID();

INSERT INTO designation (name, code, matrix, type, status)
VALUES ('Registered Nurse', 'RN1', 'RN-4', 'Nursing', 'ACTIVE');
SET @desig_id := LAST_INSERT_ID();

INSERT INTO dept (hospital_id, name, code)
VALUES (@hosp_id, 'Intensive Care Unit', 'ICU1');
SET @dept_id := LAST_INSERT_ID();

-- 2) your caller in staff (email must match JWT subject)
INSERT INTO staff (
    hospital_id, designation_id, first_name, last_name, email, phone, is_manager, status
) VALUES (
             @hosp_id, @desig_id, 'Admin', 'User', 'admin@weroster.local', '+610000000', TRUE, 'Active'
         );
SET @staff_id := LAST_INSERT_ID();

-- 3) link caller to the dept (so /my-team can find them)
INSERT INTO staff_department (staff_id, dept_id, is_primary)
VALUES (@staff_id, @dept_id, TRUE);

COMMIT;

-- make sure you have at least one hospital, dept, location
INSERT INTO Hospital(name, code, address) VALUES ('Test Hospital','TH','Somewhere')
    ON DUPLICATE KEY UPDATE name=name;
SET @hid = (SELECT id FROM Hospital WHERE code='TH' LIMIT 1);

INSERT INTO dept(hospital_id, name, code) VALUES (@hid, 'ICU', 'ICU')
    ON DUPLICATE KEY UPDATE name=name;
SET @did = (SELECT id FROM dept WHERE code='ICU' LIMIT 1);

INSERT INTO location(name, code, hospital_id) VALUES ('Ward A','WARD-A', @hid)
    ON DUPLICATE KEY UPDATE name=name;
SET @loc = (SELECT id FROM location WHERE code='WARD-A' LIMIT 1);

-- a future shift (starts in ~1 day for safety)
INSERT INTO shift(start_ts, end_ts, dept_id, location_id, code, note)
VALUES (DATE_ADD(NOW(), INTERVAL 1 DAY),
        DATE_ADD(NOW(), INTERVAL 2 DAY),
        @did, @loc, 'DAY-8H', 'Open test shift');

SET @sid = LAST_INSERT_ID();

-- mark it open
INSERT INTO open_shift(shift_id, date_made) VALUES (@sid, NOW());

ALTER TABLE open_shift
    ADD COLUMN urgent_flag TINYINT(1) NULL,
    ADD COLUMN extra_pay_cents INT NULL;

