const express = require('express');
const router = express.Router();
const cartController = require('../../Controllers/CartController');

router.get('/', cartController.getCart);
router.post('/add/:id', cartController.addToCart);
router.post('/update', cartController.updateCart);
router.post('/remove', cartController.removeFromCart);
router.post('/clear', cartController.clearCart);

module.exports = router;
