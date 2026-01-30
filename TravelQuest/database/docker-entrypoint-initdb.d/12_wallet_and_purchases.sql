-- 12_wallet_and_purchases.sql

-- ===========================================
-- ENUM TYPES (SAFE CREATION)
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_tx_type') THEN
        CREATE TYPE wallet_tx_type AS ENUM ('TOPUP', 'PURCHASE', 'ADJUSTMENT', 'REFUND');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_status') THEN
        CREATE TYPE purchase_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED');
    END IF;
END$$;

-- ===========================================
-- WALLET (one row per user)
-- - balance stored in RON (NUMERIC for money safety)
-- ===========================================
CREATE TABLE IF NOT EXISTS wallet (
    wallet_id   BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE,
    balance_ron NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (balance_ron >= 0),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_wallet_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallet_user
    ON wallet(user_id);

-- ===========================================
-- WALLET TRANSACTIONS (audit trail)
-- - keeps full history of topups/purchases/refunds
-- ===========================================
CREATE TABLE IF NOT EXISTS wallet_transaction (
    tx_id        BIGSERIAL PRIMARY KEY,
    wallet_id    BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,

    tx_type      wallet_tx_type NOT NULL,
    amount_ron   NUMERIC(12,2) NOT NULL CHECK (amount_ron > 0),
    -- sign direction: + for topup/refund, - for purchase/adjustment negative (we store separate column)
    direction    SMALLINT NOT NULL CHECK (direction IN (1, -1)),

    -- Optional references for traceability
    itinerary_id BIGINT,
    purchase_id  BIGINT,

    description  VARCHAR(255),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_wallet_tx_wallet
        FOREIGN KEY (wallet_id) REFERENCES wallet(wallet_id) ON DELETE CASCADE,

    CONSTRAINT fk_wallet_tx_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    CONSTRAINT fk_wallet_tx_itinerary
        FOREIGN KEY (itinerary_id) REFERENCES itinerary(itinerary_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_created
    ON wallet_transaction(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet_created
    ON wallet_transaction(wallet_id, created_at DESC);

-- ===========================================
-- ITINERARY PURCHASE
-- - one paid purchase allows joining a paid itinerary
-- - unique(tourist_id, itinerary_id): buy once
-- ===========================================
CREATE TABLE IF NOT EXISTS itinerary_purchase (
    purchase_id  BIGSERIAL PRIMARY KEY,
    itinerary_id BIGINT NOT NULL,
    tourist_id   BIGINT NOT NULL,

    amount_ron   NUMERIC(12,2) NOT NULL CHECK (amount_ron >= 0),
    currency     VARCHAR(10) NOT NULL DEFAULT 'RON',

    status       purchase_status NOT NULL DEFAULT 'PENDING',

    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at      TIMESTAMP WITH TIME ZONE,

    -- Optional: link to wallet tx (if paid from wallet)
    wallet_tx_id BIGINT,

    CONSTRAINT fk_purchase_itinerary
        FOREIGN KEY (itinerary_id) REFERENCES itinerary(itinerary_id) ON DELETE CASCADE,

    CONSTRAINT fk_purchase_tourist
        FOREIGN KEY (tourist_id) REFERENCES users(user_id) ON DELETE CASCADE,

    CONSTRAINT fk_purchase_wallet_tx
        FOREIGN KEY (wallet_tx_id) REFERENCES wallet_transaction(tx_id) ON DELETE SET NULL,

    CONSTRAINT uq_purchase_once_per_itinerary
        UNIQUE (tourist_id, itinerary_id)
);

CREATE INDEX IF NOT EXISTS idx_purchase_tourist_created
    ON itinerary_purchase(tourist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_purchase_itinerary
    ON itinerary_purchase(itinerary_id);

-- ===========================================
-- OPTIONAL: ensure wallets exist for current users
-- (safe insert)
-- ===========================================
INSERT INTO wallet (user_id, balance_ron)
SELECT u.user_id, 0.00
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM wallet w WHERE w.user_id = u.user_id
);

ALTER TABLE itinerary
    ADD CONSTRAINT chk_itinerary_price_positive CHECK (price > 0);

ALTER TABLE itinerary
    ALTER COLUMN price DROP DEFAULT;
