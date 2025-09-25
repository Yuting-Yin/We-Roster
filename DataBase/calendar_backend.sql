-- V20250917__calendar_backend.sql
CREATE TABLE user_staff (
                            user_id  BIGINT NOT NULL,
                            staff_id BIGINT NOT NULL,
                            PRIMARY KEY (user_id, staff_id),
                            UNIQUE KEY uq_user_staff_primary (user_id),
                            CONSTRAINT fk_us_user  FOREIGN KEY (user_id)  REFERENCES Users(Id)  ON DELETE CASCADE,
                            CONSTRAINT fk_us_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- helpful indexes for calendar/day lookups
CREATE INDEX idx_shift_start ON shift(start_ts);
CREATE INDEX idx_shift_end   ON shift(end_ts);
CREATE INDEX idx_sa_staff    ON shift_assignment(staff_id);
CREATE INDEX idx_sa_shift    ON shift_assignment(shift_id);
