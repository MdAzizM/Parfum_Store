const orderController = require('../../Controllers/OrderController');
const express = require('express');
const router = express.Router();

// Create a new order
router.post('/checkout', orderController.createOrder);

// Get all orders
router.get('/allorder', orderController.getAllOrders);

// Get single order by ID
router.get('/:id', orderController.getOrderById);

// Delete an order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
