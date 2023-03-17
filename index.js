const bodyParser = require("body-parser");
const express = require("express");

const User = require('./models/user');
const Product = require('./models/product')
const Rating = require('./models/rating');

const authRoutes = require("./routes/auth");
const storeRoutes = require("./routes/store");
const sequelize = require("./utility/database");

const app = express();

app.use(bodyParser.json());
app.use("/auth", authRoutes);
app.use(storeRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message, data });
});

User.hasMany(Rating); 
Product.hasMany(Rating); 
Rating.belongsTo(User); 
Rating.belongsTo(Product);

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
