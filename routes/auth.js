const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('--- Login attempt received ---');
    console.log('Username from request:', username);
    console.log('Password from request:', password);

    try {
        const userResult = await db.query("SELECT * FROM users WHERE user_name = $1", [username]);

        if (userResult.rows.length === 0) {
            console.log('DEBUG: User not found in database.');
            return res.status(400).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });
        }

        const user = userResult.rows[0];
        console.log('DEBUG: User found in database:', user);
        console.log('DEBUG: Hashed password from DB:', user.pw_hash);

        const isMatch = await bcrypt.compare(password, user.pw_hash);
        console.log('DEBUG: Password comparison result (isMatch):', isMatch);

        if (!isMatch) {
            console.log('DEBUG: Password does not match.');
            return res.status(400).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });
        }

        console.log('DEBUG: Password matches. Creating token...');
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ error: { code: "SERVER_ERROR", message: "An internal server error occurred." } });
    }
});

module.exports = router;
