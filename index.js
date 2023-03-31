const bodyParser = require("body-parser");
const sequelize = require("./utility/database");
const express = require("express");

const User = require("./models/user");
const Product = require("./models/product");
const Cart = require("./models/cart");
const CartProduct = require("./models/cart-product");
const Rating = require("./models/rating");
const Review = require("./models/review");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
const Address = require("./models/address");

const ProductDetails = require("./models/product-details");

const userRoutes = require("./routes/user");
const storeRoutes = require("./routes/store");

const app = express();

app.use(bodyParser.json());
app.use(userRoutes);
app.use(storeRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message, data });
});

User.hasMany(Rating);
Product.belongsTo(ProductDetails);
Product.hasMany(Rating);
Rating.belongsTo(User);
Rating.belongsTo(Product);
User.hasMany(Review);
Product.hasMany(Review);
Review.belongsTo(User);
Review.belongsTo(Product);
Review.hasOne(Rating);
Rating.belongsTo(Review); //changes hasOne
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartProduct });
Product.belongsToMany(Cart, { through: CartProduct });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });
User.hasMany(Address);
Address.belongsTo(User, { through: Order });
Order.belongsTo(Address);


sequelize
  .sync()
  .then(() => {
    const port = 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
