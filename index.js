// Packages || NPM modules
const bodyParser = require("body-parser");
const express = require("express");

// Require File Paths.
const authRoutes = require("./routes/auth");
const sequelize = require("./utility/database");

const app = express();

app.use(bodyParser.json());
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message, data });
});

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
