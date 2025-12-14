
-- Adding xd_reward atribute for itinerary objectives is order to be able to gain xp and level up by completing valid submissions during your active itineraries 

ALTER TABLE itinerary_objective
    ADD COLUMN IF NOT EXISTS xp_reward INT NOT NULL DEFAULT 50;
