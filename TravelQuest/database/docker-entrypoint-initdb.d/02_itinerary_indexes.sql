-- Indexuri pentru căutare / filtrare itinerarii
-- TO DO: index pentru filtrare dupa feedback
    -- apare dupa implementarea actiunilor pentru turist
    -- apare dupa crearea tabelului feedback

-- ITINERARY
CREATE INDEX IF NOT EXISTS idx_itinerary_title
    ON itinerary (title);

CREATE INDEX IF NOT EXISTS idx_itinerary_status
    ON itinerary (status);

CREATE INDEX IF NOT EXISTS idx_itinerary_price
    ON itinerary (price);

CREATE INDEX IF NOT EXISTS idx_itinerary_start_date
    ON itinerary (itinerary_start_date);

CREATE INDEX IF NOT EXISTS idx_itinerary_end_date
    ON itinerary (itinerary_end_date);

CREATE INDEX IF NOT EXISTS idx_itinerary_creator
    ON itinerary (creator_id);

CREATE INDEX IF NOT EXISTS idx_itinerary_created_at
    ON itinerary (created_at);


-- ITINERARY_LOCATION
CREATE INDEX IF NOT EXISTS idx_itinerary_location_itinerary
    ON itinerary_location (itinerary_id);

CREATE INDEX IF NOT EXISTS idx_itinerary_location_country
    ON itinerary_location (country);

CREATE INDEX IF NOT EXISTS idx_itinerary_location_city
    ON itinerary_location (city);


-- ITINERARY_OBJECTIVE
-- pentru potentiale filtrari viitoare 
CREATE INDEX IF NOT EXISTS idx_itinerary_objective_location
    ON itinerary_objective (location_id);

CREATE INDEX IF NOT EXISTS idx_itinerary_objective_name
    ON itinerary_objective (objective_name);

