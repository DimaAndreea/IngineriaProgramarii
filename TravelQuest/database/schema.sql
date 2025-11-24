--- ENUM TYPES ---
CREATE TYPE user_role AS ENUM ('TOURIST', 'GUIDE', 'ADMIN');

--- USER ---
CREATE TABLE users (
                       user_id       BIGSERIAL PRIMARY KEY,
                       role          user_role NOT NULL,
                       username      VARCHAR(20) NOT NULL UNIQUE,
                       password_hash VARCHAR(100) NOT NULL,
                       phone_number  VARCHAR(20) NOT NULL UNIQUE,
                       email         VARCHAR(100) NOT NULL UNIQUE,
                       level         INT NOT NULL DEFAULT 1,
                       xp            INT NOT NULL DEFAULT 0,
                       travel_coins  INT NOT NULL DEFAULT 0,
                       created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);