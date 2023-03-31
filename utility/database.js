const Sequelize = require("sequelize");

const sequelize = new Sequelize("seabasket", "root", "Sea_Flux", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
