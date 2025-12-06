-- ================================
-- ENUM TYPES (SAFE CREATION)
-- ================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('TOURIST', 'GUIDE', 'ADMIN');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'itinerary_status') THEN
        CREATE TYPE itinerary_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
END$$;

-- ================================
-- USERS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS users (
    user_id       BIGSERIAL PRIMARY KEY,
    role          VARCHAR(20) NOT NULL,  -- stored as VARCHAR, mapped in backend
    username      VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    phone_number  VARCHAR(20) NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    level         INT NOT NULL DEFAULT 1,
    xp            INT NOT NULL DEFAULT 0,
    travel_coins  INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- ITINERARY TABLE
-- ================================
CREATE TABLE IF NOT EXISTS itinerary (
    itinerary_id BIGSERIAL PRIMARY KEY,
    title        VARCHAR(100) NOT NULL,
    description  TEXT,
    category     VARCHAR(50),
    image_base64 TEXT,  -- stores base64 image from frontend
    price        INT NOT NULL DEFAULT 0,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    itinerary_start_date DATE NOT NULL,
    itinerary_end_date   DATE NOT NULL,
    creator_id   BIGINT NOT NULL,

    CONSTRAINT fk_itinerary_creator
        FOREIGN KEY (creator_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- ================================
-- ITINERARY LOCATION TABLE
-- ================================
CREATE TABLE IF NOT EXISTS itinerary_location (
    location_id  BIGSERIAL PRIMARY KEY,
    itinerary_id BIGINT NOT NULL,
    country      VARCHAR(50) NOT NULL,
    city         VARCHAR(50) NOT NULL,

    CONSTRAINT fk_location_itinerary
        FOREIGN KEY (itinerary_id) REFERENCES itinerary(itinerary_id)
        ON DELETE CASCADE
);

-- ================================
-- ITINERARY OBJECTIVE TABLE
-- ================================
CREATE TABLE IF NOT EXISTS itinerary_objective (
    objective_id BIGSERIAL PRIMARY KEY,
    location_id  BIGINT NOT NULL,
    objective_name VARCHAR(255) NOT NULL,

    CONSTRAINT fk_objective_location
        FOREIGN KEY (location_id) REFERENCES itinerary_location(location_id)
        ON DELETE CASCADE
);

