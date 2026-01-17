-- 10_missions.sql

-- ================================
-- ENUM TYPES (SAFE CREATION / EXTEND)
-- ================================
DO $$
BEGIN
    -- user mission state
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_mission_state') THEN
CREATE TYPE user_mission_state AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CLAIMED');
END IF;

    -- mission type (create or extend)
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mission_type') THEN
CREATE TYPE mission_type AS ENUM (
            -- GUIDE
            'GUIDE_PUBLISH_ITINERARY_COUNT',
            'GUIDE_ITINERARY_CATEGORY_PARTICIPANTS_COUNT',
            'GUIDE_EVALUATE_SUBMISSIONS_COUNT',

            -- TOURIST
            'TOURIST_JOIN_ITINERARY_COUNT',
            'TOURIST_JOIN_ITINERARY_CATEGORY_COUNT',
            'TOURIST_APPROVED_SUBMISSIONS_COUNT',
            'TOURIST_APPROVED_SUBMISSIONS_CATEGORY_COUNT',
            'TOURIST_APPROVED_SUBMISSIONS_SAME_ITINERARY_COUNT'
        );
ELSE
        -- Add missing enum values safely (works even if rerun)
BEGIN
EXECUTE 'ALTER TYPE mission_type ADD VALUE IF NOT EXISTS ''GUIDE_PUBLISH_ITINERARY_COUNT''';
EXCEPTION WHEN duplicate_object THEN NULL; END;

BEGIN
EXECUTE 'ALTER TYPE mission_type ADD VALUE IF NOT EXISTS ''GUIDE_ITINERARY_CATEGORY_PARTICIPANTS_COUNT''';
EXCEPTION WHEN duplicate_object THEN NULL; END;

BEGIN
EXECUTE 'ALTER TYPE mission_type ADD VALUE IF NOT EXISTS ''GUIDE_EVALUATE_SUBMISSIONS_COUNT''';
EXCEPTION WHEN duplicate_object THEN NULL; END;

BEGIN
EXECUTE 'ALTER TYPE mission_type ADD VALUE IF NOT EXISTS ''TOURIST_JOIN_ITINERARY_COUNT''';
EXCEPTION WHEN duplicate_object THEN NULL; END;

BEGIN
EXECUTE 'ALTER TYPE mission_type ADD VALUE IF NOT EXISTS ''TOURIST_JOIN_ITINERARY_CATEGORY_COUNT''';
EXCEPTION WHEN duplicate_object THEN NULL; END;

BEGIN
EXECUTE 'ALTER TYPE mission_type ADD VALUE IF NOT EXISTS ''TOURIST_APPROVED_SUBMISSIONS_COUNT''';
EXCEPTION WHEN duplicate_object THEN NULL; END;

BEGIN
EXECUTE 'ALTER TYPE mission_type ADD VALUE IF NOT EXISTS ''TOURIST_APPROVED_SUBMISSIONS_CATEGORY_COUNT''';
EXCEPTION WHEN duplicate_object THEN NULL; END;

BEGIN
EXECUTE 'ALTER TYPE mission_type ADD VALUE IF NOT EXISTS ''TOURIST_APPROVED_SUBMISSIONS_SAME_ITINERARY_COUNT''';
EXCEPTION WHEN duplicate_object THEN NULL; END;
END IF;
END$$;

-- ================================
-- MISSIONS TABLE (POSTGRES)
-- ================================
CREATE TABLE IF NOT EXISTS missions (
                                        mission_id BIGSERIAL PRIMARY KEY,

                                        code VARCHAR(100) UNIQUE,           -- optional, pentru coduri unice (ex: G_PUBLISH_10)
    title VARCHAR(255) NOT NULL,
    description TEXT,

    role VARCHAR(20) NOT NULL,          -- TOURIST / GUIDE
    type VARCHAR(50) NOT NULL,          -- mission_type (poți schimba la ENUM dacă vrei)

    target_value INT NOT NULL CHECK (target_value > 0),

    params_json TEXT,                   -- stocăm JSON ca TEXT pentru compatibilitate cu backend

    start_at TIMESTAMP,                 -- backend folosește LocalDateTime
    end_at TIMESTAMP NOT NULL,

    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    reward_points INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    scope VARCHAR(20) NOT NULL DEFAULT 'BOTH',

    CONSTRAINT fk_missions_created_by
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,

    CONSTRAINT chk_missions_status
    CHECK (status IN ('DRAFT','ACTIVE','EXPIRED')),

    CONSTRAINT chk_missions_scope
    CHECK (scope IN ('BOTH','TOURIST','GUIDE'))
    );

CREATE INDEX IF NOT EXISTS idx_missions_role
    ON missions(role);

CREATE INDEX IF NOT EXISTS idx_missions_type
    ON missions(type);

CREATE INDEX IF NOT EXISTS idx_missions_creator
    ON missions(created_by);

CREATE INDEX IF NOT EXISTS idx_missions_start_end
    ON missions(start_at, end_at);

-- ================================
-- MISSION REWARDS
-- ================================
CREATE TABLE IF NOT EXISTS mission_rewards (
                                               reward_id BIGSERIAL PRIMARY KEY,
                                               mission_id BIGINT NOT NULL,

                                               xp_reward INT NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
    real_reward_title VARCHAR(255),
    real_reward_description TEXT,

    CONSTRAINT fk_rewards_mission
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_rewards_mission
    ON mission_rewards(mission_id);

-- ================================
-- USER MISSION PARTICIPATION / PROGRESS
-- ================================
CREATE TABLE IF NOT EXISTS user_missions (
                                             user_mission_id BIGSERIAL PRIMARY KEY,

                                             user_id BIGINT NOT NULL,
                                             mission_id BIGINT NOT NULL,

                                             state VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    progress_value INT NOT NULL DEFAULT 0 CHECK (progress_value >= 0),

    anchor_itinerary_id BIGINT,           -- optional, pentru misiuni “same itinerary”

    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    claimed_at TIMESTAMP,

    CONSTRAINT uq_user_mission UNIQUE(user_id, mission_id),

    CONSTRAINT fk_user_missions_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    CONSTRAINT fk_user_missions_mission
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_user_missions_user
    ON user_missions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_missions_mission
    ON user_missions(mission_id);

-- ================================
-- USER MISSION ITINERARIES (distinct tracking)
-- ================================
CREATE TABLE IF NOT EXISTS user_mission_itineraries (
                                                        id BIGSERIAL PRIMARY KEY,
                                                        user_mission_id BIGINT NOT NULL,
                                                        itinerary_id BIGINT NOT NULL,

                                                        CONSTRAINT uq_user_mission_itinerary UNIQUE(user_mission_id, itinerary_id),

    CONSTRAINT fk_um_it_user_mission
    FOREIGN KEY (user_mission_id) REFERENCES user_missions(user_mission_id) ON DELETE CASCADE,

    CONSTRAINT fk_um_it_itinerary
    FOREIGN KEY (itinerary_id) REFERENCES itinerary(itinerary_id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_um_it_user_mission
    ON user_mission_itineraries(user_mission_id);

-- ================================
-- CLAIM LOG (optional)
-- ================================
CREATE TABLE IF NOT EXISTS mission_claims (
                                              claim_id BIGSERIAL PRIMARY KEY,
                                              user_id BIGINT NOT NULL,
                                              mission_id BIGINT NOT NULL,
                                              claimed_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT uq_claim UNIQUE(user_id, mission_id),

    CONSTRAINT fk_claim_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    CONSTRAINT fk_claim_mission
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_claims_user
    ON mission_claims(user_id);

CREATE INDEX IF NOT EXISTS idx_claims_mission
    ON mission_claims(mission_id);


---------------- +
ALTER TABLE missions
    RENAME COLUMN created_by TO creator_id;
