
-- column for the badge selected by the user in order to be displayed on their profile 
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS selected_badge_id BIGINT;

-- FK constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
          AND constraint_name = 'fk_users_selected_badge'
          AND table_name = 'users'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT fk_users_selected_badge
            FOREIGN KEY (selected_badge_id)
            REFERENCES badge (badge_id)
            ON DELETE SET NULL;
    END IF;
END$$;
