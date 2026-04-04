/*
    1 -> decides how things actually happen, independent of HTTP requests
    2 -> the only place that talks directly to the database
    3. -> handles complex sequences
 */

import pool from '../db/data.js'

// ===================================================
// HELPER FUNCTIONS
// ===================================================

// reuse: gets account and verification for account creation, edit, update, and deactivate/reactivate
// client = database connection object
// accountId = the user trying to deactivate
// userId = this is WHO is trying to deactivate the account
// authorization: making sure the person trying to access actually owns the account
async function getAccountWithOwnership(db, accountId, userId) {
    const result = await db.query(
        `SELECT a.id, a.balance, a.status, a.account_type
        FROM accounts a
        INNER JOIN account_owner ao ON a.id = ao.account_id
        WHERE a.id = $1 AND ao.user_id = $2`,
        [accountId, userId]
    );
    
    if (result.rows.length === 0) throw new Error("Account not found.");
    
    return result.rows[0];
}

// validates that an account can be deactivated
async function validateAccountForDeactivation(client, accountStatus) {
    if (accountStatus === 'active') throw new Error(`Cannot deactivate ${accountStatus} account. Contact for assistance.`)
}





// CREATE ACCOUNT
export async function createAccount(l_name, f_name, birthday, social, initialBalance = 0, accountType = 'checking') {
    if (!l_name || !f_name || !birthday || !social) throw new Error('Required fields missing');
    if (initialBalance < 0) throw new Error('Initial balance cannot be negative.')

    let query = 'INSERT INTO accounts (l_name, f_name, birthday, social, balance, accountType) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const params = [l_name, f_name, birthday, social, initialBalance, accountType];
    const { rows } = await pool.query(query, params);
    
    return rows[0] || null;
}

//TODO: by their bday
export async function getAccountById(id, includeInactive = false) {
    let query = 'SELECT * FROM accounts WHERE id = $1';
    const params = [id];
    
    if (!includeInactive) query += ' AND is_active = true';
    
    const { rows } = await pool.query(query, params);
    
    return rows[0] || null;
}


export async function editAccount(id, updates) {
    // as per CO: only name cannot be edited
    // no modification -> no timestamp change -> no UPDATE query
    const ALLOWED_FIELDS = ['phone_number', 'address', 'email'];
    
    if ( id === undefined ) return null;
    
    const fields = [];
    const params = [];
    let index = 1;
    
    for (let key of ALLOWED_FIELDS) {
        if (updates[key] !== undefined) {
            // update column (key/'phone_number') using placeholders ($1, $2...)
            fields.push(`${key} = $${index}`);
            params.push(updates[key]);
            index++;
        }
    }
    
    // nothing to update
    if ( fields.length === 0 ) return null;
    
    // program quits if there is nothing to update, thus not updating time
    fields.push(`updated_at = NOW()`);
    
    const query = `
        UPDATE accounts
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `;
    
    params.push(id);
    
    const { rows } = await pool.query(query, params);
    
    // return (rows.length > 0)? rows[0] : null;
    if (rows.length === 0) return null;
    
    return rows[0];
}


export async function upgradeAccount(id, newType) {
    // TODO
}

export async function deactivateAccount(accountId, userId, reason) {

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const account = await getAccountWithOwnership(client, accountId, userId);
        if (account.status !== 'active')
        
    }
    
    
    

    const params = [id];
    
    if (id === undefined) return null;
    
    const balanceCheck = await pool.query(
        'SELECT balance FROM accounts WHERE id = $1',
        [id]
    );
    
    if (balanceCheck.rows[0].balance !== 0) {
        throw new Error('Cannot deactivate account with non-zero balance.')
    }

    const query = `
    UPDATE accounts
    SET is_active = false,
        update_at = NOW()
    WHERE id = $1 AND is_active = true
    RETURNING *
    `;
    
    const { rows } = await pool.query(query, params);
    
    // if the account is already inactive and nothing was returned
    if (rows.length === 0) return null;
    
    return rows[0];
}

export async function reactivateAccount(id) {
    //TODO
}