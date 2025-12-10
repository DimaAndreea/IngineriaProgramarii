-- ===========================================
-- 05_active_itinerary_indexes.sql
-- Indexuri pentru tabelele:
--   - itinerary_participant
--   - feedback
--   - objective_submission
-- ===========================================

-- === itinerary_participant ===
CREATE INDEX IF NOT EXISTS idx_itinerary_participant_itinerary
    ON itinerary_participant (itinerary_id);

CREATE INDEX IF NOT EXISTS idx_itinerary_participant_tourist
    ON itinerary_participant (tourist_id);

-- === feedback ===
CREATE INDEX IF NOT EXISTS idx_feedback_itinerary
    ON feedback (itinerary_id);

CREATE INDEX IF NOT EXISTS idx_feedback_to_user
    ON feedback (to_user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_from_user
    ON feedback (from_user_id);

-- === objective_submission ===
CREATE INDEX IF NOT EXISTS idx_objective_submission_objective
    ON objective_submission (objective_id);

CREATE INDEX IF NOT EXISTS idx_objective_submission_user
    ON objective_submission (user_id);

CREATE INDEX IF NOT EXISTS idx_objective_submission_guide
    ON objective_submission (guide_id);

CREATE INDEX IF NOT EXISTS idx_objective_submission_status
    ON objective_submission (status);
