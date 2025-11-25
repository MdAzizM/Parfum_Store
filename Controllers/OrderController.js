const db = require('../src/db/sqlite');

// Add this function to your OrderController.js

exports.createOrder = (req, res) => {
  // 1. Get items from the CART table
  const cartSql = `
      SELECT cart.product_id, cart.quantity, products.price 
      FROM cart 
      JOIN products ON cart.product_id = products.id
  `;

  db.all(cartSql, [], (err, cartItems) => {
    if (err) return res.status(500).send("Database error: " + err.message);
    
    if (!cartItems || cartItems.length === 0) {
      return res.redirect('/cart'); 
    }

    // 2. Calculate Total
    let total = 0;
    cartItems.forEach(item => {
      total += item.price * item.quantity;
    });

    // 3. Save to Orders
    db.serialize(() => {
      // FIX: Changed 'order_date' to 'created_at' to match your database
      const insertOrderSql = "INSERT INTO orders (created_at, total) VALUES (?, ?)";
      
      db.run(insertOrderSql, [new Date().toISOString(), total], function(err) {
        if (err) return res.status(500).send("Order Insert Error: " + err.message);
        
        const newOrderId = this.lastID;

        // 4. Save Order Items
        const stmt = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
        
        cartItems.forEach(item => {
          stmt.run(newOrderId, item.product_id, item.quantity, item.price);
        });
        stmt.finalize();

        // 5. Empty the Cart
        db.run("DELETE FROM cart", [], (delErr) => {
            if (delErr) console.error(delErr);
            // Redirect to Home with success message
            res.redirect('/?message=OrderSuccess');
        });
      });
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
