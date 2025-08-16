const express = require('express');
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const router = express.Router();
router.get('/products', authMiddleware, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Server error");
    }
});
router.get('/products/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send("Server error");
    }
});
router.post('/products', authMiddleware, async (req, res) => {
    const { name, sku, category, price, currency } = req.body;
    try {
        const newProduct = await db.query(
            "INSERT INTO products (name, sku, category, price, currency) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, sku, category, price, currency]
        );
        res.status(201).json(newProduct.rows[0]);
    } catch (err) {
        res.status(500).send("Server error");
    }
});
router.put('/products/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, sku, category, price, currency } = req.body;
    try {
        const result = await db.query(
            "UPDATE products SET name = $1, sku = $2, category = $3, price = $4, currency = $5 WHERE id = $6 RETURNING *",
            [name, sku, category, price, currency, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send("Server error");
    }
});
module.exports = router;
