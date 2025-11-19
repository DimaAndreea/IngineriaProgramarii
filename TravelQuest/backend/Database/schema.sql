-- === ENUM TYPES ===
CREATE TYPE user_role AS ENUM ('TOURIST', 'GUIDE', 'ADMIN');
CREATE TYPE itinerary_status AS ENUM ('DRAFT', 'PUBLISHED', 'PENDING');
CREATE TYPE submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- === USER ===
CREATE TABLE users (
                       user_id       BIGSERIAL PRIMARY KEY,
                       role          user_role      NOT NULL,
                       first_name    VARCHAR(20)    NOT NULL,
                       last_name     VARCHAR(20)    NOT NULL,
                       password_hash VARCHAR(100)   NOT NULL,
                       phone_number  VARCHAR(20),
                       email         VARCHAR(100)   NOT NULL UNIQUE,
                       level         INT            NOT NULL DEFAULT 1,
                       xp            INT            NOT NULL DEFAULT 0,
                       travel_coins  INT            NOT NULL DEFAULT 0,
                       created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- === ITINERARY ===
CREATE TABLE itinerary (
                           itinerary_id BIGSERIAL PRIMARY KEY,
                           title        VARCHAR(20)      NOT NULL,
                           description  VARCHAR(100),
                           category     VARCHAR(20),
                           price        INT              NOT NULL DEFAULT 0,
                           status       itinerary_status NOT NULL DEFAULT 'DRAFT',
                           created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                           creator_id   BIGINT           NOT NULL,
                           CONSTRAINT fk_itinerary_creator
                               FOREIGN KEY (creator_id) REFERENCES users (user_id)
);

-- === MISSION ===
CREATE TABLE mission (
                         mission_id    BIGSERIAL PRIMARY KEY,
                         itinerary_id  BIGINT         NOT NULL,
                         title         VARCHAR(20)    NOT NULL,
                         description   VARCHAR(100),
                         reward_xp     INT            NOT NULL DEFAULT 0,
                         reward_coins  INT            NOT NULL DEFAULT 0,
                         created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                         CONSTRAINT fk_mission_itinerary
                             FOREIGN KEY (itinerary_id) REFERENCES itinerary (itinerary_id)
                                 ON DELETE CASCADE
);

-- === REWARD ===
CREATE TABLE reward (
                        reward_id    BIGSERIAL PRIMARY KEY,
                        name         VARCHAR(20)    NOT NULL,
                        description  VARCHAR(200),
                        price        INT            NOT NULL,
                        reward_type  VARCHAR(20)    NOT NULL
);

-- === BADGE ===
CREATE TABLE badge (
                       badge_id       BIGSERIAL PRIMARY KEY,
                       name           VARCHAR(20) NOT NULL,
                       level_required INT         NOT NULL
);

-- === FEEDBACK ===
CREATE TABLE feedback (
                          feedback_id  BIGSERIAL PRIMARY KEY,
                          from_user_id BIGINT      NOT NULL,
                          to_user_id   BIGINT      NOT NULL,
                          itinerary_id BIGINT      NOT NULL,
                          rating       INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
                          comment      VARCHAR(100),
                          created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                          CONSTRAINT fk_feedback_from_user
                              FOREIGN KEY (from_user_id) REFERENCES users (user_id) ON DELETE CASCADE,
                          CONSTRAINT fk_feedback_to_user
                              FOREIGN KEY (to_user_id) REFERENCES users (user_id) ON DELETE CASCADE,
                          CONSTRAINT fk_feedback_itinerary
                              FOREIGN KEY (itinerary_id) REFERENCES itinerary (itinerary_id) ON DELETE CASCADE
);

-- === PARTICIPATION (user joins itinerary) ===
CREATE TABLE participation (
                               user_id      BIGINT NOT NULL,
                               itinerary_id BIGINT NOT NULL,
                               joined_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                               PRIMARY KEY (user_id, itinerary_id),
                               CONSTRAINT fk_participation_user
                                   FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
                               CONSTRAINT fk_participation_itinerary
                                   FOREIGN KEY (itinerary_id) REFERENCES itinerary (itinerary_id) ON DELETE CASCADE
);

-- === PURCHASE (user buys reward) ===
CREATE TABLE purchase (
                          user_id    BIGINT NOT NULL,
                          reward_id  BIGINT NOT NULL,
                          bought_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                          PRIMARY KEY (user_id, reward_id),
                          CONSTRAINT fk_purchase_user
                              FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
                          CONSTRAINT fk_purchase_reward
                              FOREIGN KEY (reward_id) REFERENCES reward (reward_id) ON DELETE CASCADE
);

-- === USER_BADGE (user wins badge) ===
CREATE TABLE user_badge (
                            user_id     BIGINT NOT NULL,
                            badge_id    BIGINT NOT NULL,
                            awarded_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                            PRIMARY KEY (user_id, badge_id),
                            CONSTRAINT fk_user_badge_user
                                FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
                            CONSTRAINT fk_user_badge_badge
                                FOREIGN KEY (badge_id) REFERENCES badge (badge_id) ON DELETE CASCADE
);

-- === SUBMISSION (tourist submits proof for mission, guide validates) ===
CREATE TABLE submission (
                            user_id        BIGINT            NOT NULL,  -- tourist
                            mission_id     BIGINT            NOT NULL,
                            guide_id       BIGINT            NOT NULL,
                            submission_url VARCHAR(255)      NOT NULL,
                            status         submission_status NOT NULL DEFAULT 'PENDING',
                            submitted_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                            validated_at   TIMESTAMP WITH TIME ZONE,
                            PRIMARY KEY (user_id, mission_id),
                            CONSTRAINT fk_submission_user
                                FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
                            CONSTRAINT fk_submission_mission
                                FOREIGN KEY (mission_id) REFERENCES mission (mission_id) ON DELETE CASCADE,
                            CONSTRAINT fk_submission_guide
                                FOREIGN KEY (guide_id) REFERENCES users (user_id)
);
