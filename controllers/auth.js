const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const helperFunction = require("../utility/helper");
const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    res.status(422).json({
      error: error.message,
      message: errors.array()[0],
    });
    throw error;
  }
  const { email, name, password, phoneNo } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      name,
      phoneNo,
    });
    const userData = await user.save();
    await helperFunction.sendMail(email);
    res.status(201).json({ message: "User created!", user: userData });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
