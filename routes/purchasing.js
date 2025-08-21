const express = require('express');
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

// --- Supplier CRUD Endpoints ---

// GET all suppliers
router.get('/suppliers', authMiddleware, async (req, res) => {
    try {
        // Added supplier_code to the returned fields for the list view
        const result = await db.query("SELECT id, supplier_code, legal_name, contact_name, phone_no, is_active FROM suppliers ORDER BY legal_name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// POST (create) a new supplier
router.post('/suppliers', authMiddleware, async (req, res) => {
    const {
        supplier_code, legal_name, local_name, registered_address, contact_name, email, phone_no,
        website, description_of_supply, bank_currency, beneficiary_name,
        beneficiary_address, account_no, beneficiary_bank_name,
        beneficiary_bank_address, iban, swift_code
    } = req.body;
    try {
        const newSupplier = await db.query(
            `INSERT INTO suppliers (
                supplier_code, legal_name, local_name, registered_address, contact_name, email, phone_no,
                website, description_of_supply, bank_currency, beneficiary_name,
                beneficiary_address, account_no, beneficiary_bank_name,
                beneficiary_bank_address, iban, swift_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
            [
                supplier_code, legal_name, local_name, registered_address, contact_name, email, phone_no,
                website, description_of_supply, bank_currency, beneficiary_name,
                beneficiary_address, account_no, beneficiary_bank_name,
                beneficiary_bank_address, iban, swift_code
            ]
        );
        res.status(201).json(newSupplier.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// PUT (update) a supplier by ID
router.put('/suppliers/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const {
        supplier_code, legal_name, local_name, registered_address, contact_name, email, phone_no,
        website, description_of_supply, bank_currency, beneficiary_name,
        beneficiary_address, account_no, beneficiary_bank_name,
        beneficiary_bank_address, iban, swift_code, is_active
    } = req.body;
    try {
        const result = await db.query(
            `UPDATE suppliers SET
                supplier_code = $1, legal_name = $2, local_name = $3, registered_address = $4, contact_name = $5,
                email = $6, phone_no = $7, website = $8, description_of_supply = $9,
                bank_currency = $10, beneficiary_name = $11, beneficiary_address = $12,
                account_no = $13, beneficiary_bank_name = $14, beneficiary_bank_address = $15,
                iban = $16, swift_code = $17, is_active = $18
            WHERE id = $19 RETURNING *`,
            [
                supplier_code, legal_name, local_name, registered_address, contact_name, email, phone_no,
                website, description_of_supply, bank_currency, beneficiary_name,
                beneficiary_address, account_no, beneficiary_bank_name,
                beneficiary_bank_address, iban, swift_code, is_active, id
            ]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Supplier not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// DELETE a supplier by ID
router.delete('/suppliers/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM suppliers WHERE id = $1", [id]);
        res.status(200).json({ message: "Supplier deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
