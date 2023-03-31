const bodyParser = require("body-parser");
const sequelize = require("./utility/database");
const express = require("express");

const User = require("./models/user");
const Product = require("./models/product");
const Rating = require("./models/rating");
const Review = require("./models/review");

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
