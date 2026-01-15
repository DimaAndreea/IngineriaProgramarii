-- 11_levels_and_history.sql

-- ===========================================
-- LEVELS TABLE (thresholds by total XP)
-- level = nivelul (1..n)
-- min_total_xp = pragul minim de XP total pentru acel nivel
-- ===========================================
CREATE TABLE IF NOT EXISTS levels (
    level        INT PRIMARY KEY,
    min_total_xp INT NOT NULL UNIQUE
);

-- Seed praguri (poți ajusta oricând)
-- Curba respectă exemplele tale: L2=100, L3=250, L4=500 și apoi creștere accelerată.
INSERT INTO levels (level, min_total_xp) VALUES
(1, 0),
(2, 100),
(3, 250),
(4, 500),
(5, 800),
(6, 1200),
(7, 1700),
(8, 2300),
(9, 3050),
(10, 4000),
(11, 5200),
(12, 6700),
(13, 8550),
(14, 10900),
(15, 13800),
(16, 17450),
(17, 22000),
(18, 27700),
(19, 34800),
(20, 43700)
ON CONFLICT (level) DO NOTHING;

-- ===========================================
-- USER POINTS HISTORY
-- log pentru orice modificare de XP ("points")
-- ===========================================
CREATE TABLE IF NOT EXISTS user_points_history (
    history_id BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,       -- ex: OBJECTIVE_APPROVED, ITINERARY_JOINED, SUBMISSION_VALIDATED
    points_delta INT NOT NULL,              -- +50, +25, +5, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- metadata opțional (pt debugging / analytics)
    itinerary_id BIGINT,
    objective_id BIGINT,
    submission_id BIGINT,

    CONSTRAINT fk_points_history_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_points_history_user_created
    ON user_points_history(user_id, created_at DESC);

-- ===========================================
-- USER LEVEL HISTORY
-- log doar când nivelul se schimbă
-- ===========================================
CREATE TABLE IF NOT EXISTS user_level_history (
    level_history_id BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    old_level   INT NOT NULL,
    new_level   INT NOT NULL,
    changed_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason      VARCHAR(50),                -- ex: XP_UPDATE

    CONSTRAINT fk_level_history_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_level_history_user_changed
    ON user_level_history(user_id, changed_at DESC);
