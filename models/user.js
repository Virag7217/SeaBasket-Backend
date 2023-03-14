const Sequelize = require("sequelize");
const sequelize = require("../utility/database");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    
  },
  phoneNo: {
    type: Sequelize.STRING,
    allowNull: true,
  }
});

module.exports = User;