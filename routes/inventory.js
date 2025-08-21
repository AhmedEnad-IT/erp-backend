const express = require('express');
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

// GET all products
router.get('/products', authMiddleware, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// GET a single product by ID
router.get('/products/:id', authMiddleware, async (req, res) => {
    console.log('--- GET request received for single product ID:', req.params.id); // Debug message
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            console.log('--- DEBUG: Product not found in database.');
            return res.status(404).json({ message: "Product not found" });
        }

        console.log('--- DEBUG: Product found:', result.rows[0]); // Debug message
        res.json(result.rows[0]);
    } catch (err) {
        console.error('--- GET SINGLE PRODUCT ERROR:', err.message); // Debug message
        res.status(500).send("Server error");
    }
});

// POST (create) a new product
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

// PUT (update) a product by ID
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

// DELETE a product by ID
router.delete('/products/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOp = await db.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).send("Server error");
    }
});

module.exports = router;
