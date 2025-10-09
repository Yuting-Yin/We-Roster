-- We-Roster Database Schema
-- This file contains the complete database structure for the We-Roster application
-- Generated from JPA entities and current application state

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS shift_swap;
DROP TABLE IF EXISTS open_shift_request;
DROP TABLE IF EXISTS shift_designation_requirements;
DROP TABLE IF EXISTS shift_assignment;
DROP TABLE IF EXISTS open_shift;
DROP TABLE IF EXISTS shift;
DROP TABLE IF EXISTS leave_request;
DROP TABLE IF EXISTS staff_department;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS designation;
DROP TABLE IF EXISTS dept;
DROP TABLE IF EXISTS hospital;

-- Create Hospital table
CREATE TABLE hospital (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Department table
CREATE TABLE dept (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    hospital_id BIGINT NOT NULL,
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospital(id) ON DELETE CASCADE,
    UNIQUE KEY UK_dept_hospital_code (hospital_id, code)
);

-- Create Designation table
CREATE TABLE designation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Location table
CREATE TABLE location (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    address TEXT,
    hospital_id BIGINT NOT NULL,
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospital(id) ON DELETE CASCADE
);

-- Create Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    domain VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_domain (domain),
    INDEX idx_users_status (status)
);

-- Create Staff table
CREATE TABLE staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    is_manager BOOLEAN NOT NULL DEFAULT FALSE,
    hospital_id BIGINT NOT NULL,
    designation_id BIGINT NOT NULL,
    user_id BIGINT UNIQUE,
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospital(id) ON DELETE CASCADE,
    FOREIGN KEY (designation_id) REFERENCES designation(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_staff_hospital (hospital_id),
    INDEX idx_staff_designation (designation_id),
    INDEX idx_staff_status (status)
);

-- Create Staff Department junction table
CREATE TABLE staff_department (
    staff_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    PRIMARY KEY (staff_id, department_id),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES dept(id) ON DELETE CASCADE
);

-- Create Shift table
CREATE TABLE shift (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    start_ts DATETIME NOT NULL,
    end_ts DATETIME NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    note TEXT,
    dept_id BIGINT NOT NULL,
    location_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES dept(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES location(id) ON DELETE CASCADE,
    INDEX idx_shift_dept (dept_id),
    INDEX idx_shift_location (location_id),
    INDEX idx_shift_start_ts (start_ts),
    INDEX idx_shift_status (status)
);

-- Create Shift Assignment table
CREATE TABLE shift_assignment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shift_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    assigned_by BIGINT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shift_id) REFERENCES shift(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES staff(id) ON DELETE SET NULL,
    UNIQUE KEY UK_shift_staff (shift_id, staff_id),
    INDEX idx_shift_assignment_staff (staff_id),
    INDEX idx_shift_assignment_status (status),
    CHECK (status IN ('ACTIVE', 'WITHDRAWN', 'CANCELLED'))
);

-- Create Open Shift table
CREATE TABLE open_shift (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shift_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shift_id) REFERENCES shift(id) ON DELETE CASCADE,
    UNIQUE KEY UK_open_shift_shift (shift_id)
);

-- Create Shift Designation Requirements table
CREATE TABLE shift_designation_requirements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shift_id BIGINT NOT NULL,
    designation_id BIGINT NOT NULL,
    required_count INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shift_id) REFERENCES shift(id) ON DELETE CASCADE,
    FOREIGN KEY (designation_id) REFERENCES designation(id) ON DELETE CASCADE,
    UNIQUE KEY UK_shift_designation (shift_id, designation_id)
);

-- Create Leave Request table
CREATE TABLE leave_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by BIGINT NULL,
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES staff(id) ON DELETE SET NULL,
    INDEX idx_leave_request_staff (staff_id),
    INDEX idx_leave_request_status (status),
    INDEX idx_leave_request_dates (start_date, end_date),
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

-- Create Open Shift Request table
CREATE TABLE open_shift_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    open_shift_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (open_shift_id) REFERENCES open_shift(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    INDEX idx_open_shift_request_staff (staff_id),
    INDEX idx_open_shift_request_status (status),
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

-- Create Shift Swap table
CREATE TABLE shift_swap (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id BIGINT NOT NULL,
    target_id BIGINT NOT NULL,
    shift_id BIGINT NOT NULL,
    from_time DATETIME NOT NULL,
    to_time DATETIME NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'AWAITING',
    date_made DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shift(id) ON DELETE CASCADE,
    INDEX idx_shift_swap_requester (requester_id),
    INDEX idx_shift_swap_target (target_id),
    INDEX idx_shift_swap_shift (shift_id),
    INDEX idx_shift_swap_status (status),
    CHECK (status IN ('AWAITING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

-- Create Notification table
CREATE TABLE notification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    INDEX idx_notification_staff (staff_id),
    INDEX idx_notification_type (type),
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_created (created_time)
);

-- Insert default data (optional - for reference)
-- Note: In production, this data is populated by DataInitializer.java

-- Sample Hospital
INSERT INTO hospital (name, code, address, phone, email) VALUES 
('WeRoster General Hospital', 'WGH', '123 Healthcare Ave, Medical City', '+1-555-0123', 'info@werosterhospital.com');

-- Sample Departments
INSERT INTO dept (name, code, hospital_id) VALUES 
('Emergency Department', 'ED', 1),
('Intensive Care Unit', 'ICU', 1),
('Medical Ward', 'MW', 1);

-- Sample Designations
INSERT INTO designation (name, code) VALUES 
('Doctor', 'DR'),
('Nurse', 'NURSE'),
('Administrator', 'ADMIN'),
('Technician', 'TECH'),
('Support Staff', 'SUPPORT'),
('Manager', 'MGR');

-- Sample Locations
INSERT INTO location (name, code, address, hospital_id) VALUES 
('Main Building', 'MAIN', '123 Healthcare Ave, Medical City', 1),
('Emergency Wing', 'ER', '123 Healthcare Ave, Medical City', 1),
('ICU Floor', 'ICU', '123 Healthcare Ave, Medical City', 1);

-- Database schema creation completed
-- This schema matches the current JPA entity structure and supports all application features
