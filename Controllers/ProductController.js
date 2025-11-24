const db = require('../src/db/sqlite');

const getAllProducts = (req, res) => {
    const sql = "SELECT * FROM products";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
}

const getProductById = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM products WHERE id = ?";
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(row);
    });
}

module.exports = {
    getAllProducts,
    getProductById
};