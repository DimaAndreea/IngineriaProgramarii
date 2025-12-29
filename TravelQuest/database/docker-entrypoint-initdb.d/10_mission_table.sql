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
