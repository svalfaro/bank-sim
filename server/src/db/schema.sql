-- ================================================
-- schema.sql
-- run this file to initialize the database from scratch
-- order matters: tables with foreign keys come after the tables they reference
-- ================================================

-- enable uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- USERS
-- stores profile from Google OAuth
-- never store passwords; google handles authentication
-- only store what google provides + what we need internally
-- DATA MINIMIZATION: less data stored = smaller breach surface
-- ================================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id   VARCHAR(255) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delete_at   TIMESTAMPTZ --NULL means active
);

-- ================================================
-- TABLES
-- ================================================
CREATE TABLE IF NOT EXISTS accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    account_type    VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings')),
    balance         DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    status          VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- SESSIONS
-- sid -> session id, random string
-- sess -> session data stored as json, where user_id, and any other session data lives
-- expire -> when this session expires, connect-pg-simple auto cleans up expired sessions
-- ================================================
CREATE TABLE IF NOT EXISTS sessions (
    sid     VARCHAR NOT NULL PRIMARY KEY,
    sess    JSON NOT NULL,
    expire  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions (expire);

-- ================================================
-- TRANSACTIONS
-- ================================================
CREATE TABLE IF NOT EXISTS transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_account_id     UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    to_account_id       UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    transaction_type    VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer')),
    amount              NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status              VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    description         VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (from_account_id IS NOT NULL OR to_account_id IS NOT NULL)
);

-- ================================================
-- AUDIT LOGS
-- ================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE RESTRICT,
    account_id          UUID REFERENCES accounts(id) ON DELETE RESTRICT,
    transaction_id      UUID REFERENCES transactions(id) ON DELETE RESTRICT,
    event_name          VARCHAR(50) NOT NULL,
    ip_address          VARCHAR(45) NOT NULL,
    user_agent          VARCHAR(500) NOT NULL,
    status              VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed')),
    metadata            JSON,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- columns you filter on frequently get indexes
-- speeds up queries at the cost of slightly slower writes
-- ================================================
-- find all accounts belonging to a user
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- find all transactions involving an account
CREATE INDEX IF NOT EXISTS idx_transactions_from_account ON transactions(from_account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_to_account ON transactions(to_account_id);

-- find all audit logs for a specific user
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- find audit logs by event type (brute force detection, etc)
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_name ON audit_logs(event_name);

-- find audit logs by time range
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);



