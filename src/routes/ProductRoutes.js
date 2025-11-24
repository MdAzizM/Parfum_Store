const ProductController = require('../../Controllers/ProductController');
const express = require('express');
const router = express.Router();

//routes 

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

module.exports = router;