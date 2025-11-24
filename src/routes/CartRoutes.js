const express = require('express');
const router = express.Router();
const cartController = require('../../Controllers/CartController');

router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/update', cartController.updateCart);
router.post('/cart/remove', cartController.removeFromCart);
router.post('/cart/clear', cartController.clearCart);

module.exports = router;
