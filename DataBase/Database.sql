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
    CONSTRAINT fk_staff_hospital FOREIGN KEY (hospital_id) REFERENCES hospital(id),
    CONSTRAINT fk_staff_designation FOREIGN KEY (designation_id) REFERENCES designation(id)
) ENGINE = InnoDB;

CREATE TABLE dept(
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT NULL,
    hospital_id BIGINT NOT NULL,
    name VARCHAR(300) NOT NULL,
    code VARCHAR(60) UNIQUE,
    note TEXT,
    CONSTRAINT fk_dept_hospital FOREIGN KEY (hospital_id) REFERENCES hospital(id),
    CONSTRAINT fk_dept_parent FOREIGN KEY (parent_id) REFERENCES dept(id)
) ENGINE=InnoDB;

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

CREATE TABLE staff_department(
       staff_id BIGINT NOT NULL,
       dept_id BIGINT NOT NULL,
       is_primary BOOLEAN NOT NULL DEFAULT FALSE,
       assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
       PRIMARY KEY (staff_id, dept_id),
       CONSTRAINT fk_sd_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
       CONSTRAINT fk_sd_dept  FOREIGN KEY (dept_id)  REFERENCES dept(id)  ON DELETE CASCADE
) ENGINE = InnoDB;

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

CREATE TABLE location (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE,
  hospital_id BIGINT NOT NULL,
  parent_id    BIGINT NULL,
  note TEXT,
  type VARCHAR(50),
  CONSTRAINT fk_loc_parent FOREIGN KEY (parent_id)   REFERENCES location(id),
  CONSTRAINT fk_loc_hospital  FOREIGN KEY (hospital_id) REFERENCES hospital(id)
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


CREATE TABLE roster_template (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  name VARCHAR(120) NOT NULL,
  code VARCHAR(50),
  created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note TEXT
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
)

