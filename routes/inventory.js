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
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// GET a single product by ID
router.get('/products/:id', authMiddleware, async (req, res) => {
    // ... (existing code)
});

// POST (create) a new product
router.post('/products', authMiddleware, async (req, res) => {
    // ... (existing code)
});

// PUT (update) a product by ID
router.put('/products/:id', authMiddleware, async (req, res) => {
    // ... (existing code)
});

// DELETE a product by ID
router.delete('/products/:id', authMiddleware, async (req, res) => {
    console.log('--- DELETE request received for product ID:', req.params.id);
    const { id } = req.params;
    try {
        const deleteOp = await db.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);

        if (deleteOp.rowCount === 0) {
            console.log('--- DEBUG: Product not found in database for deletion.');
            return res.status(404).json({ message: "Product not found" });
        }

        console.log('--- DEBUG: Product successfully deleted from database.');
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error('--- DELETE ERROR:', err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
