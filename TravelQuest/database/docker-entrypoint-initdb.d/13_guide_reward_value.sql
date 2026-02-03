-- add exposure/fame points reward for guides (stored as users.travel_coins)
ALTER TABLE mission_rewards
ADD COLUMN IF NOT EXISTS travel_coins_reward INT NOT NULL DEFAULT 0 CHECK (travel_coins_reward >= 0);
