-- This is used for dummy team shift for fictional May month

-- 1) Ensure a hospital with Id = 1 exists
INSERT INTO Hospital (Id, Name, Code, Address)
SELECT 1, 'PMCC', 'PMCC', 'Parkville'
WHERE NOT EXISTS (SELECT 1 FROM Hospital WHERE Id = 1);

-- 2) (optional) A department under that hospital (if you’ll need it)
INSERT INTO dept (id, hospital_id, name, code)
SELECT 4, 1, 'Intensive Care Unit', 'ICU'
WHERE NOT EXISTS (SELECT 1 FROM dept WHERE id = 4);

-- 3) Now your location insert will work (adjust ids/names as you like)
INSERT INTO location (id, hospital_id, parent_id, name, code, type)
SELECT 8, 1, NULL, 'ICU Bay A', 'ICU-A', 'Ward'
WHERE NOT EXISTS (SELECT 1 FROM location WHERE id = 8);


-- Ensure a location you can point shifts at
INSERT INTO location (id, hospital_id, parent_id, name, code, type, note)
SELECT 901, 1, NULL, 'PMCC', 'PMCC', 'Ward', NULL
    WHERE NOT EXISTS (SELECT 1 FROM location WHERE id = 901);

-- Make sure dept 4 exists (skip if you already have ICU as 4)
-- INSERT INTO dept (id, hospital_id, parent_id, name, code, note)
-- VALUES (4, 1, NULL, 'Intensive Care Unit', 'ICU', NULL)
-- ON DUPLICATE KEY UPDATE id = id;

-- Two day shifts in May (8h each)
INSERT INTO shift (id, start_ts, end_ts, dept_id, location_id, code, note)
VALUES
    (99001, '2025-05-14 08:00:00', '2025-05-14 16:00:00', 4, 901, 'DAY-8H', 'Seed shift'),
    (99002, '2025-05-21 08:00:00', '2025-05-21 16:00:00', 4, 901, 'DAY-8H', 'Seed shift')
    ON DUPLICATE KEY UPDATE id = id;

-- Assign them to staff id 3
INSERT INTO shift_assignment (shift_id, staff_id)
VALUES (99001, 3), (99002, 3)
    ON DUPLICATE KEY UPDATE shift_id = shift_id;