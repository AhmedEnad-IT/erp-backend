const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userResult = await db.query("SELECT * FROM users WHERE user_name = $1", [username]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });
        }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.pw_hash);
        if (!isMatch) {
            return res.status(400).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });
        }
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
