const Sequelize = require("sequelize");
const sequelize = require("../utility/database");

const Address = sequelize.define(
  "address",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    state: { type: Sequelize.STRING, allowNull: false },
    zip: { type: Sequelize.STRING, allowNull: false },
  },
  {
    timestamps: false,
  }
);

module.exports = Address;
