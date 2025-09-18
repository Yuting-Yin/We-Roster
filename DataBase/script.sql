-- 选一个模板班次（优先用 99003；不存在就回退到任意一条）
SELECT dept_id, location_id
INTO @D, @L
FROM (
         SELECT dept_id, location_id FROM shift WHERE id = 99003
         UNION ALL
         SELECT dept_id, location_id FROM shift LIMIT 1
     ) AS src
    LIMIT 1;

-- 新建一个“未分配”的班次（不往 shift_assignment 插任何记录）
INSERT INTO shift (start_ts, end_ts, dept_id, location_id)
VALUES ('2025-09-22 09:00:00', '2025-09-22 13:00:00', @D, @L);

SET @NEW_SHIFT_ID := LAST_INSERT_ID();

-- 校验：应为 0，表示无人分配 = unallocated
SELECT COUNT(*) AS assignments FROM shift_assignment WHERE shift_id = @NEW_SHIFT_ID;

-- 输出新建的 unallocated shift id
SELECT @NEW_SHIFT_ID AS UNALLOCATED_SHIFT_ID;
