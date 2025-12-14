-- ===========================================
-- TABEL BADGE (INSIGNE)
-- ===========================================
CREATE TABLE IF NOT EXISTS badge (
    badge_id    BIGSERIAL PRIMARY KEY,
    code        VARCHAR(100) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    min_level   INT NOT NULL,                -- minimum level requierd to unlock the badge
    role        VARCHAR(20) NOT NULL DEFAULT 'TOURIST'
);

-- ===========================================
-- TABEL USER_BADGE (USERS <-> BADGE)
-- ===========================================
CREATE TABLE IF NOT EXISTS user_badge (
    user_badge_id BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL,
    badge_id      BIGINT NOT NULL,
    awarded_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_user_badge_user
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,

    CONSTRAINT fk_user_badge_badge
        FOREIGN KEY (badge_id) REFERENCES badge (badge_id) ON DELETE CASCADE,

    -- a unique badge can only be unlocked once
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

-- ===========================================
-- BADGE INSERTS
-- ON CONFLICT prevents data duplication
-- ===========================================
INSERT INTO badge (code, name, description, min_level, role)
VALUES
    ('T_FIRST_STEPS', 'First Steps', 'Reached level 3 as a tourist.', 3, 'TOURIST'),
    ('T_CASUAL_TRAVELER', 'Casual Traveler', 'Reached level 5 as a tourist.', 5, 'TOURIST'),
    ('T_FANATIC_TRAVELER', 'Fanatic Traveler', 'Reached level 10 as a tourist.', 10, 'TOURIST'),
    ('T_RACE_AROUND_WORLD', 'Race around the world', 'Reached level 20 as a tourist.', 20, 'TOURIST'),
    ('G_NOVICE_GUIDE', 'Novice Guide', 'Reached level 3 as a guide.', 3, 'GUIDE'),
    ('G_DESTINATION_COUNSELOR', 'Destination Counselor', 'Reached level 5 as a guide.', 5, 'GUIDE'),
    ('G_ASTONISHING_GUIDE', 'Astonishing Guide', 'Reached level 10 as a guide.', 10, 'GUIDE'),
    ('G_WORLD_EXPERT', 'World Expert', 'Reached level 20 as a guide.', 20, 'GUIDE')
ON CONFLICT (code) DO NOTHING;