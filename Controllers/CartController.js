const db = require('../src/db/sqlite');

// GET /cart → list all cart items
exports.getCart = (req, res) => {
    const sql = `
        SELECT cart.id, products.name, products.price, products.image_url, cart.quantity
        FROM cart
        JOIN products ON cart.product_id = products.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};

// POST /cart/add → add product to cart
exports.addToCart = (req, res) => {
    const { product_id, quantity } = req.body;

    if (!product_id) return res.status(400).json({ error: "product_id required" });

    const sql = `INSERT INTO cart (product_id, quantity) VALUES (?, ?)`;

    db.run(sql, [product_id, quantity || 1], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Added to cart" });
    });
};

// POST /cart/update → update quantity
exports.updateCart = (req, res) => {
    const { id, quantity } = req.body;

    if (!id || !quantity) return res.status(400).json({ error: "id and quantity required" });

    const sql = `UPDATE cart SET quantity = ? WHERE id = ?`;

    db.run(sql, [quantity, id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Cart updated" });
    });
};

// POST /cart/remove → delete one item
exports.removeFromCart = (req, res) => {
    const { id } = req.body;

    if (!id) return res.status(400).json({ error: "id required" });

    const sql = `DELETE FROM cart WHERE id = ?`;

    db.run(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Item removed" });
    });
};

// POST /cart/clear → clear entire cart
exports.clearCart = (req, res) => {
    const sql = `DELETE FROM cart`;

    db.run(sql, [], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Cart cleared" });
    });
};
