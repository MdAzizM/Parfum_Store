const db = require('../src/db/sqlite');

// Create a new order
exports.createOrder = (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) return res.status(400).json({ error: "No items provided" });

  let placeholders = items.map(() => '?').join(',');
  let productIds = items.map(i => i.product_id);

  db.all(`SELECT id, price FROM products WHERE id IN (${placeholders})`, productIds, (err, products) => {
    if (err) return res.status(500).json({ error: err.message });

    let total = 0;
    items.forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      if (product) total += product.price * item.quantity;
    });

    db.run("INSERT INTO orders (order_date, total) VALUES (?, ?)", [new Date().toISOString(), total], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const orderId = this.lastID;

      const stmt = db.prepare("INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)");
      items.forEach(item => stmt.run(orderId, item.product_id, item.quantity));
      stmt.finalize();

      res.json({ message: "Order placed", order_id: orderId, total });
    });
  });
};

// Get all orders
exports.getAllOrders = (req, res) => {
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Get order by ID (with items)
exports.getOrderById = (req, res) => {
  const orderId = req.params.id;

  db.get("SELECT * FROM orders WHERE id = ?", [orderId], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!order) return res.status(404).json({ error: "Order not found" });

    db.all("SELECT * FROM order_items WHERE order_id = ?", [orderId], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });

      order.items = items;
      res.json(order);
    });
  });
};

// Delete an order
exports.deleteOrder = (req, res) => {
  const orderId = req.params.id;

  db.run("DELETE FROM order_items WHERE order_id = ?", [orderId], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    db.run("DELETE FROM orders WHERE id = ?", [orderId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Order deleted", order_id: orderId });
    });
  });
};
