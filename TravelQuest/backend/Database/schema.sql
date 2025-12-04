--- ENUM TYPES ---
/*
CREATE TYPE user_role AS ENUM ('TOURIST', 'GUIDE', 'ADMIN');
CREATE TYPE itinerary_status AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED');
CREATE TYPE submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
*/
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('TOURIST', 'GUIDE', 'ADMIN');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'itinerary_status') THEN
        CREATE TYPE itinerary_status AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
END$$;

--- USER ---
CREATE TABLE IF NOT EXISTS users (
                       user_id       BIGSERIAL PRIMARY KEY,
                       role          VARCHAR(20) NOT NULL,
                       username      VARCHAR(20) NOT NULL UNIQUE,
                       password_hash VARCHAR(100) NOT NULL,
                       phone_number  VARCHAR(20) NOT NULL UNIQUE,
                       email         VARCHAR(100) NOT NULL UNIQUE,
                       level         INT NOT NULL DEFAULT 1,
                       xp            INT NOT NULL DEFAULT 0,
                       travel_coins  INT NOT NULL DEFAULT 0,
                       created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


--- ITINERARY ---
CREATE TABLE IF NOT EXISTS itinerary (
                           itinerary_id BIGSERIAL PRIMARY KEY,
                           title        VARCHAR(20)      NOT NULL,
                           description  VARCHAR(100),
                           category     VARCHAR(20),
                           image_url VARCHAR(255) NOT NULL,
                           price        INT              NOT NULL DEFAULT 0,
                           status       itinerary_status NOT NULL DEFAULT 'DRAFT',
                           created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                           itinerary_start_date DATE NOT NULL,
                           itinerary_end_date DATE NOT NULL,
                           creator_id   BIGINT           NOT NULL,

                           CONSTRAINT fk_itinerary_creator
                               FOREIGN KEY (creator_id) REFERENCES users (user_id)
);

--- ITINERARY - LOCATION ---
CREATE TABLE IF NOT EXISTS itinerary_location (
                                    location_id   BIGSERIAL PRIMARY KEY,
                                    itinerary_id  BIGINT NOT NULL,
                                    country       VARCHAR(50) NOT NULL,
                                    city          VARCHAR(50) NOT NULL,
                                    objective_name    VARCHAR(100) NOT NULL,
                                    order_index   INT NOT NULL DEFAULT 1,

                                    CONSTRAINT fk_itinerary_location_itinerary
                                        FOREIGN KEY (itinerary_id) REFERENCES itinerary(itinerary_id)
                                        ON DELETE CASCADE
);

--- OBJECTIVE VALIDATION MISSION ---
CREATE TABLE IF NOT EXISTS objective_mission (
                                    objective_mission_id BIGSERIAL PRIMARY KEY,
                                    itinerary_id   BIGINT NOT NULL,
                                    location_id    BIGINT NOT NULL,
                                    description    VARCHAR(200) NOT NULL,
                                    reward_xp      INT NOT NULL DEFAULT 50,

                                    CONSTRAINT fk_mission_itinerary
                                        FOREIGN KEY (itinerary_id) REFERENCES itinerary(itinerary_id)
                                        ON DELETE CASCADE,

                                    CONSTRAINT fk_mission_location
                                        FOREIGN KEY (location_id) REFERENCES itinerary_location(location_id)
                                        ON DELETE CASCADE
);



--- SUBMISSION ---
CREATE TABLE IF NOT EXISTS submission (
                            submission_id BIGSERIAL PRIMARY KEY,
                            objective_mission_id    BIGINT NOT NULL,
                            tourist_id       BIGINT NOT NULL, -- turist
                            guide_id      BIGINT NOT NULL, -- ghid validator
                            submission_url VARCHAR(255) NOT NULL,
                            status         submission_status NOT NULL DEFAULT 'PENDING',
                            submitted_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                            validated_at   TIMESTAMP WITH TIME ZONE,

                            CONSTRAINT fk_submission_user
                                FOREIGN KEY (tourist_id) REFERENCES users(user_id) ON DELETE CASCADE,

                            CONSTRAINT fk_submission_guide
                                FOREIGN KEY (guide_id) REFERENCES users(user_id),

                            CONSTRAINT fk_submission_mission
                                FOREIGN KEY (objective_mission_id) REFERENCES objective_mission(objective_mission_id) ON DELETE CASCADE
);