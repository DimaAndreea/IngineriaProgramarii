
-- Adding xd_granted atribute for itinerary objectives is order to be able to gain xp and level up by completing valid submissions during your active itineraries 

ALTER TABLE objective_submission
    ADD COLUMN IF NOT EXISTS xp_granted BOOLEAN NOT NULL DEFAULT FALSE;