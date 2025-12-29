-- ================================
-- MISSIONS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS missions (
                                        mission_id     BIGSERIAL PRIMARY KEY,
                                        title          VARCHAR(100) NOT NULL,
    description    TEXT NOT NULL,
    deadline       TIMESTAMP WITH TIME ZONE NOT NULL,
                                 reward_points  INT NOT NULL CHECK (reward_points > 0),
    creator_id     BIGINT NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_mission_creator
    FOREIGN KEY (creator_id)
    REFERENCES users (user_id)
                             ON DELETE CASCADE
    );

-- Indexuri utile
CREATE INDEX IF NOT EXISTS idx_mission_creator
    ON missions (creator_id);

CREATE INDEX IF NOT EXISTS idx_mission_deadline
    ON missions (deadline);


-- verificari ulterioare
ALTER TABLE missions
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
ADD COLUMN scope VARCHAR(20) NOT NULL DEFAULT 'BOTH';

ALTER TABLE missions
    ADD CONSTRAINT chk_missions_status
        CHECK (status IN ('ACTIVE','EXPIRED','DRAFT'));

ALTER TABLE missions
    ADD CONSTRAINT chk_missions_scope
        CHECK (scope IN ('BOTH','TOURIST','GUIDE'));

-- ================================
-- MISSION PARTICIPATION TABLE
-- avem nevoie de o tabelă separată, de tip many-to-many, între users și missions
-- ================================
CREATE TABLE IF NOT EXISTS mission_participation (
                                                     participation_id BIGSERIAL PRIMARY KEY,
                                                     mission_id BIGINT NOT NULL,
                                                     user_id BIGINT NOT NULL,
                                                     status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_participation_mission
    FOREIGN KEY (mission_id) REFERENCES missions(mission_id)
                         ON DELETE CASCADE,

    CONSTRAINT fk_participation_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
                         ON DELETE CASCADE,

    CONSTRAINT uniq_user_mission UNIQUE (mission_id, user_id)
    );

-- Indexuri utile
CREATE INDEX IF NOT EXISTS idx_participation_mission
    ON mission_participation (mission_id);

CREATE INDEX IF NOT EXISTS idx_participation_user
    ON mission_participation (user_id);

---
ALTER TABLE mission_participation
    ADD COLUMN progress integer NOT NULL DEFAULT 0;
