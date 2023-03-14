const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const helperFunction = require("../utility/helper");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const secretKey = "seabasket";
const { Op } = require("sequelize");

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
    res.status(201).json({ message: "User created!", user: userData });
    await helperFunction.sendMail(email);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  let authenticatedUser;
  const { emailOrPhoneNo, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailOrPhoneNo }, { phoneNo: emailOrPhoneNo }],
      },
    });
    if (!user) {
      const error = new Error(`A user with this ${email} not found.`);
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }
    authenticatedUser = user;
    const token = jwt.sign(
      {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        phoneNo: authenticatedUser.phoneNo,
      },
      secretKey,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "user successfully loggedin !!",
      userId: authenticatedUser.id.toString(),
      token: token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
