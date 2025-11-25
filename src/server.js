const express = require('express');
const path = require('path');
const morgan = require('morgan');
const ejs = require('ejs');
const db = require('./db/sqlite');

const productRoutes = require('./routes/ProductRoutes');
const OrderRoutes = require('./routes/OrderRoutes');
const CartRoutes = require('./routes/CartRoutes');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')));
app.set("views", path.join(__dirname, "../views"));

//routes
app.use('/order', OrderRoutes);
app.use('/Cart', CartRoutes);
app.use('/', productRoutes);


// 404 handler

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '../views', '404.html'));
});

app.listen(3000, () => console.log("Server running on port 3000"));
