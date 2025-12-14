-- ===========================================
-- 04_active_itinerary_tables.sql
-- Tabele noi pentru:
--   - itinerary_participant
--   - feedback
--   - objective_submission
-- ===========================================

-- === ITINERARY PARTICIPANT (users <-> itinerary) ===
-- Leagă utilizatorii turiști de itinerariu (cine participă la el)
CREATE TABLE IF NOT EXISTS itinerary_participant (
                                                     participant_id BIGSERIAL PRIMARY KEY,
                                                     itinerary_id   BIGINT NOT NULL,
                                                     tourist_id     BIGINT NOT NULL,
                                                     joined_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_itinerary_participant_itinerary
    FOREIGN KEY (itinerary_id) REFERENCES itinerary (itinerary_id) ON DELETE CASCADE,

    CONSTRAINT fk_itinerary_participant_tourist
    FOREIGN KEY (tourist_id) REFERENCES users (user_id) ON DELETE CASCADE,

    -- un turist poate participa o singură dată la un itinerariu
    CONSTRAINT uq_itinerary_participant UNIQUE (itinerary_id, tourist_id)
    );

-- ===========================================
-- FEEDBACK (ex: tourist -> guide pentru un itinerariu)
-- ===========================================
CREATE TABLE IF NOT EXISTS feedback (
                                        feedback_id  BIGSERIAL PRIMARY KEY,
                                        from_user_id BIGINT      NOT NULL,  -- cine trimite feedback (ex: turistul)
                                        to_user_id   BIGINT      NOT NULL,  -- cine primește feedback (ex: ghidul)
                                        itinerary_id BIGINT      NOT NULL,  -- itinerariul la care se referă feedback-ul
                                        rating       INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment      VARCHAR(500),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_feedback_from_user
    FOREIGN KEY (from_user_id) REFERENCES users (user_id) ON DELETE CASCADE,

    CONSTRAINT fk_feedback_to_user
    FOREIGN KEY (to_user_id) REFERENCES users (user_id) ON DELETE CASCADE,

    CONSTRAINT fk_feedback_itinerary
    FOREIGN KEY (itinerary_id) REFERENCES itinerary (itinerary_id) ON DELETE CASCADE,

    -- un user poate lăsa un singur feedback per itinerariu
    CONSTRAINT uq_feedback_unique_per_user_itinerary
    UNIQUE (from_user_id, itinerary_id)
    );

-- ===========================================
-- OBJECTIVE SUBMISSION
-- (tourist submits proof for mission/objective, guide validates)
-- ===========================================
CREATE TABLE IF NOT EXISTS objective_submission (
                                                    submission_id  BIGSERIAL         PRIMARY KEY,
                                                    user_id        BIGINT            NOT NULL,  -- turistul
                                                    objective_id   BIGINT            NOT NULL,  -- obiectivul (tabelul itinerary_objective)
                                                    guide_id       BIGINT            NOT NULL,  -- ghidul responsabil / validator
                                                    submission_url VARCHAR(255)      NOT NULL,
    status         submission_status NOT NULL DEFAULT 'PENDING',
    submitted_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    validated_at   TIMESTAMP WITH TIME ZONE,

                                 CONSTRAINT fk_objective_submission_user
                                 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,

    CONSTRAINT fk_objective_submission_objective
    FOREIGN KEY (objective_id) REFERENCES itinerary_objective (objective_id) ON DELETE CASCADE,

    CONSTRAINT fk_objective_submission_guide
    FOREIGN KEY (guide_id) REFERENCES users (user_id),

    -- un turist poate trimite o singură submisie per obiectiv
    CONSTRAINT uq_objective_submission_unique_per_user_objective
    UNIQUE (user_id, objective_id)
    );