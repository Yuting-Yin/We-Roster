INSERT INTO user_staff(user_id, staff_id)
SELECT u.Id, s.id
FROM Users u JOIN staff s ON LOWER(u.email)=LOWER(s.email)
WHERE u.email='admin@weroster.local'
    LIMIT 1;