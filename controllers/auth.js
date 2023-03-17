const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const helperFunction = require("../utility/helper");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const secretKey = "seabasket";
const randomstring = require("randomstring");
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
    await helperFunction.signedUpMail(email);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
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
    let email = authenticatedUser.email;
    let userName = authenticatedUser.name;
    const code = randomstring.generate({ length: 6, charset: "numeric" });
    const token = jwt.sign(
      {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        verificationCode: code,
      },
      secretKey,
      { expiresIn: "1h" }
    );
    await helperFunction.loginVerificationMail({ email, userName, code });
    res.status(200).json({
      message: "Verification mail sent!",
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

exports.loginVerification = async (req, res, next) => {
  const { token } = req.params;
  const { OTP } = req.body;
  try {
    let id, code;
    const decodedToken = jwt.verify(token, secretKey);
    id = decodedToken.id;
    code = decodedToken.verificationCode;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      const error = new Error(`A user with this ${id} not found.`);
      error.statusCode = 401;
      throw error;
    }
    if (code !== OTP) {
      return res.status(406).json({
        message: `Wrong OTP ! Please enter valid OTP!`,
      });
    }
    return res.status(200).json({
      message: `Loggin Successfull!!`,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.resetPasswordLink = async (req, res, next) => {
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
  const { email } = req.body;
  let loadedUser, id;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error(`A user with this ${email} not found.`);
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;
    id = loadedUser.id;
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      secretKey,
      { expiresIn: "5m" }
    );
    await helperFunction.resetPasswordMail({ email, token });
    res.status(200).json({
      message: "mail sent !!",
      userId: user.id.toString(),
      token: token,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.ResetPasswordPage = async (req, res, next) => {
  const { token } = req.params;
  try {
    let decodedToken, id, email;
    decodedToken = jwt.verify(token, secretKey);
    id = decodedToken.id;
    email = decodedToken.email;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      const error = new Error(`A user with this ${id} not found.`);
      error.statusCode = 401;
      throw error;
    }
    res.status(200).json({
      message: `reset passsword page for ${email}`,
      user: decodedToken,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
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
  let { token } = req.params;
  const { newPassword } = req.body;
  try {
    let decodedToken, id, email;
    decodedToken = jwt.verify(token, secretKey);
    id = decodedToken.id;
    email = decodedToken.email;
    const user = await User.findOne({ where: { id, email } });
    if (!user) {
      const error = new Error(`A user with this ${email} not found.`);
      error.statusCode = 401;
      throw error;
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    token = undefined;
    user.password = newHashedPassword;
    await user.save();
    res.status(200).json({
      message: "Password changed!!",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
