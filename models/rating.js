const Sequelize = require("sequelize");
const sequelize = require("../utility/database");

const Rating = sequelize.define("rating", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  rating: {
    type: Sequelize.TINYINT,
    allowNull: false,
  },
});

module.exports = Rating;
