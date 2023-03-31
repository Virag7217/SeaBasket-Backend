const Sequelize = require("sequelize");

const sequelize = require("../utility/database");

const CartProduct = sequelize.define(
  "cartProduct",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    quantity: Sequelize.INTEGER,
  },
  {
    timestamps: false,
  }
);

module.exports = CartProduct;
