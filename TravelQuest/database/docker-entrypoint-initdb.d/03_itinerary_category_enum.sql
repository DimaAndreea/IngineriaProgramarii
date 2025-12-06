DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'itinerary_category') THEN
        CREATE TYPE itinerary_category AS ENUM (
            'CULTURAL',
            'ADVENTURE',
            'CITY_BREAK',
            'ENTERTAINMENT',
            'EXOTIC'
        );
    END IF;
END$$;