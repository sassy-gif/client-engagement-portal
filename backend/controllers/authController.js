const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');

// POST /api/auth/login
// Works for all three roles — same table, role field decides access.
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If this user is a client, fetch their client_id so the frontend
    // can immediately scope requests to the right client workspace.
    let clientId = null;
    if (user.role === 'client') {
      const [clientRows] = await pool.query(
        'SELECT id FROM clients WHERE user_id = ?',
        [user.id]
      );
      clientId = clientRows[0]?.id || null;
    }

  const tokenPayload = {
      id: user.id,
      role: user.role,
      fullName: user.full_name,
      clientId
    };

    // Short-lived access token — used for normal API calls
    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    // Long-lived refresh token — random string, stored in DB, used only to get new access tokens
    const refreshToken = crypto.randomBytes(40).toString('hex');
    await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        clientId
      }
    });  
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
}

// GET /api/auth/me — returns current user info based on token
async function getCurrentUser(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, role FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/refresh
// Takes a refresh token, verifies it matches what's stored for that user,
// and issues a fresh access token — no password needed.
async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE refresh_token = ? AND is_active = TRUE',
      [refreshToken]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = rows[0];

    let clientId = null;
    if (user.role === 'client') {
      const [clientRows] = await pool.query('SELECT id FROM clients WHERE user_id = ?', [user.id]);
      clientId = clientRows[0]?.id || null;
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role, fullName: user.full_name, clientId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ message: 'Server error refreshing token' });
  }
}
module.exports = { login, getCurrentUser, refresh };