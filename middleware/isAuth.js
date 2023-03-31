const jwt = require("jsonwebtoken");
const secretKey = "seabasket";

module.exports = (req, res, next) => {
  let user;
  
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  try {
    user = jwt.verify(token, secretKey);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!user) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  req.user = user;
  next();
};
