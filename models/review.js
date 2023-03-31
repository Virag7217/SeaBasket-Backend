const Sequelize = require("sequelize");
const sequelize = require("../utility/database");

const Review = sequelize.define("review", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  review: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  image: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
});

module.exports = Review;
