// Adjust this path to match your folder structure exactly
const db = require('../src/db/sqlite'); 

/* =========================================
   1. GET CART (Render the Page)
   ========================================= */
exports.getCart =async (req, res) => {
    // We still need to fetch data to show inside vCart
    const sql = `
        SELECT cart.product_id, cart.quantity, products.name, products.price, products.image_url 
        FROM cart 
        JOIN products ON cart.product_id = products.id
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching cart:", err);
            // Render vCart with empty data if DB fails
            return res.render('Cart', { cartItems: [] });
        }

        // HERE IS THE CHANGE: Rendering 'vCart'
        res.render('Cart', { cartItems: rows });
    });
};

/* =========================================
   2. ADD TO CART (Handle 'Add' Button)
   ========================================= */
exports.addToCart = (req, res) => {
    const productId = req.params.id;

    // 1. Check if product is already in cart
    const checkSql = "SELECT * FROM cart WHERE product_id = ?";
    
    db.get(checkSql, [productId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }

        if (row) {
            // A. Item exists: Increase Quantity
            const updateSql = "UPDATE cart SET quantity = quantity + 1 WHERE product_id = ?";
            db.run(updateSql, [productId], (updateErr) => {
                if (updateErr) return res.status(500).json({ success: false });
                sendBadgeCount(res);
            });
        } else {
            // B. New Item: Insert into Cart
            const insertSql = "INSERT INTO cart (product_id, quantity) VALUES (?, 1)";
            db.run(insertSql, [productId], (insertErr) => {
                if (insertErr) return res.status(500).json({ success: false });
                sendBadgeCount(res);
            });
        }
    });
};

// Helper: Counts total items to update the Navbar Badge (Gold Coin)
function sendBadgeCount(res) {
    db.get("SELECT SUM(quantity) as total FROM cart", [], (err, result) => {
        const totalItems = (result && result.total) ? result.total : 0;
        res.json({ success: true, totalItems: totalItems });
    });
}

/* =========================================
   3. CHECKOUT (The "Buy" Logic)
   ========================================= */
exports.checkout = (req, res) => {
    // 1. Fetch items to calculate total
    const cartSql = `
        SELECT cart.product_id, cart.quantity, products.price 
        FROM cart 
        JOIN products ON cart.product_id = products.id
    `;

    db.all(cartSql, [], (err, cartItems) => {
        if (err || !cartItems || cartItems.length === 0) {
            return res.redirect('/cart'); // Cannot checkout empty cart
        }

        // 2. Calculate Total Price
        let totalPrice = 0;
        cartItems.forEach(item => {
            totalPrice += (item.price * item.quantity);
        });

        // 3. START TRANSACTION (db.serialize ensures order of operations)
        db.serialize(() => {
            
            // A. Create the Order
            const createOrderSql = "INSERT INTO orders (total, created_at) VALUES (?, datetime('now'))";

            // We use 'function' here to access 'this.lastID'
            db.run(createOrderSql, [totalPrice], function(err) {
                if (err) {
                    console.error("Order Insert Error:", err);
                    return res.redirect('/cart');
                }

                const newOrderId = this.lastID; // The ID of the order we just created

                // B. Insert Order Items (Using Prepared Statement for speed)
                const orderItemSql = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
                const stmt = db.prepare(orderItemSql);

                cartItems.forEach(item => {
                    stmt.run(newOrderId, item.product_id, item.quantity, item.price);
                });

                stmt.finalize(); // Close the statement

                // C. Empty the Cart
                db.run("DELETE FROM cart", [], (delErr) => {
                    if (delErr) console.error("Error clearing cart:", delErr);
                    
                    console.log(`Order #${newOrderId} placed successfully.`);
                    // Redirect to Home with a success query param
                    res.redirect('/?message=OrderSuccess'); 
                });
            });
        });
    });
};

/* =========================================
   4. REMOVE ONE ITEM
   ========================================= */
exports.removeFromCart = (req, res) => {
    // Requires app.use(express.urlencoded({ extended: true })) in server.js
    const productId = req.body.product_id; 
    
    db.run("DELETE FROM cart WHERE product_id = ?", [productId], (err) => {
        if (err) console.error(err);
        res.redirect('/cart');
    });
};

/* =========================================
   5. CLEAR ENTIRE CART
   ========================================= */
exports.clearCart = (req, res) => {
    db.run("DELETE FROM cart", [], (err) => {
        if (err) console.error(err);
        res.redirect('/cart');
    });
};

/* =========================================
   6. UPDATE CART (Optional Placeholder)
   ========================================= */
exports.updateCart = (req, res) => {
    // Future logic for + / - buttons can go here
    res.redirect('/cart');
};