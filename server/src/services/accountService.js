/*
 * accountService.js
 *
 * Single responsibility: all database operations for accounts.
 * This is the ONLY file that talks directly to the database.
 * Controllers call these functions — they never touch the DB directly.
 *
 * Pattern: services handle business logic + DB queries.
 * Controllers handle HTTP requests + responses.
 */

import pool from '../db/data.js'

// ── Helper functions ────────────────────────────────────────────────────────

/*
 * OWASP A01:2025 BROKEN ACCESS CONTROL
 * ownership verification happens at the DATA LAYER, not just the route layer
 * my approach:  verify the query
 * JOIN account_owner on both account_id AND user_id
 * if the JOIN returns nothing, access is denied regardless of route guards.
 * 
 * Reusable ownership check — verifies the account exists AND belongs to the
 * requesting user. Used by any operation that modifies an account.
 *
 * Why: authorization must happen at the data layer, not just the route layer.
 * A user who guesses an account ID should never be able to modify it.
 */
async function getAccountWithOwnership(db, accountId, userId) {
    const result = await db.query(
        `SELECT a.id, a.balance, a.status, a.account_type
        FROM accounts a
        INNER JOIN account_owner ao ON a.id = ao.account_id
        WHERE a.id = $1 AND ao.user_id = $2`,
        [accountId, userId]
    );

    if (result.rows.length === 0) throw new Error('Account not found or access denied.');

    return result.rows[0];
}

// ── Account operations ──────────────────────────────────────────────────────

/*
 * Creates a new account.
 * initialBalance defaults to 0 — accounts should start empty in production.
 * accountType defaults to 'checking' — most common account type.
 */
export async function createAccount(userId, accountType = 'checking', initialBalance = 0) {
    if (!userId) throw new Error('User ID is required.');
    if (initialBalance < 0) throw new Error('Initial balance cannot be negative.');

    const { rows } = await pool.query(
        `INSERT INTO accounts (user_id, account_type, balance, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING id, account_type, balance, status, created_at`,
        [userId, accountType, initialBalance]
    );

    return rows[0];
}

/*
 * Fetches a single account by ID.
 * includeInactive: false by default — inactive accounts are effectively deleted
 * from the user's perspective. Only admin operations pass true.
 */
export async function getAccountById(accountId, userId, includeInactive = false) {
    let query = `
        SELECT a.id, a.account_type, a.balance, a.status, a.created_at
        FROM accounts a
        INNER JOIN account_owner ao ON a.id = ao.account_id
        WHERE a.id = $1 AND ao.user_id = $2
    `;

    if (!includeInactive) query += ` AND a.status = 'active'`;

    const { rows } = await pool.query(query, [accountId, userId]);

    return rows[0] || null;
}

/*
 * OWASP A01:2025 BROKEN ACCESS CONTROL
 * mass assignment is a vulnerability where an attacker sends unexpected fields
 * in a request body to modify columns they should NOT control.
 * the fix: only explicitly permitted fields reach the database.
 * the database never sees fields the application didn't approve. *
 * 
 * Updates allowed contact fields only.
 *
 * Why ALLOWED_FIELDS: never trust the client to tell you what columns to update.
 * Without this, a malicious user could send { "status": "active", "balance": 99999 }
 * and update fields they should never touch. This is called mass assignment —
 * a real vulnerability that has caused production incidents.
 */
export async function editAccount(accountId, userId, updates) {
    const ALLOWED_FIELDS = ['phone_number', 'address', 'email'];

    const fields = [];
    const params = [];
    let index = 1;

    for (const key of ALLOWED_FIELDS) {
        if (updates[key] !== undefined) {
            fields.push(`${key} = $${index}`);
            params.push(updates[key]);
            index++;
        }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    params.push(accountId, userId);

    const { rows } = await pool.query(
        `UPDATE accounts a
         SET ${fields.join(', ')}
         FROM account_owner ao
         WHERE a.id = ao.account_id
         AND a.id = $${index}
         AND ao.user_id = $${index + 1}
         RETURNING a.id, a.email, a.phone_number, a.address, a.updated_at`,
        params
    );

    return rows[0] || null;
}

/*
 * OWASP A06:2025 INSECURE DESIGN
 * deactivation is a multistep operation; each step must success or
 * the entire operation rolls back. no partial state is acceptable.
 *
 * execution: verify ownership -> check zero balance -> update status -> audit log
 *
 * Deactivates an account.
 *
 * Uses a transaction (BEGIN/COMMIT) because this is a multi-step operation:
 * 1. verify ownership
 * 2. verify zero balance
 * 3. update status
 *
 * If any step fails, ROLLBACK undoes everything. The account either fully
 * deactivates or nothing changes — no partial state. That's ACID compliance.
 *
 * Why client instead of pool: pool.query() auto-manages connections.
 * For transactions, we need ONE dedicated connection held open across
 * multiple queries. pool.connect() gives us that dedicated connection.
 * We MUST release() it in finally — or the connection leaks and the pool
 * eventually runs out of connections.
 */
export async function deactivateAccount(accountId, userId, reason) {
    if (!reason) throw new Error('A reason is required to deactivate an account.');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Step 1: verify ownership — throws if not found or not owned
        const account = await getAccountWithOwnership(client, accountId, userId);

        // Step 2: business rule — cannot deactivate with remaining balance
        if (account.balance !== 0) {
            throw new Error('Account must have zero balance before deactivation.');
        }

        // Step 3: status must currently be active
        if (account.status !== 'active') {
            throw new Error(`Account is already ${account.status}.`);
        }

        // Step 4: deactivate
        const { rows } = await client.query(
            `UPDATE accounts
             SET status = 'inactive', updated_at = NOW()
             WHERE id = $1
             RETURNING id, status, updated_at`,
            [accountId]
        );

        // Step 5: write to audit log
        await client.query(
            `INSERT INTO audit_logs (user_id, account_id, action, reason, created_at)
             VALUES ($1, $2, 'ACCOUNT_DEACTIVATED', $3, NOW())`,
            [userId, accountId, reason]
        );

        await client.query('COMMIT');

        return rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;

    } finally {
        // always runs — even if catch re-throws
        // this is why finally exists: guaranteed cleanup
        client.release();
    }
}

/*
 * TODO: reactivateAccount — Phase 4
 * TODO: upgradeAccount — Phase 4
 */