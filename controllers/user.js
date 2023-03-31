const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const { Op } = require("sequelize");

const User = require("../models/user");
const helperFunction = require("../utility/helper");

const secretKey = "seabasket";

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
    if (userData) {
      await helperFunction.signedUpMail(email);
      res.status(201).json({ message: "User created!", user: userData });
    } else {
      res.status(500).json({ message: "Internal Server Error!" });
    }
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
      const error = new Error(`User with this ${emailOrPhoneNo} not found.`);
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Invalid email or password !");
      error.statusCode = 401;
      throw error;
    }
    authenticatedUser = user;
    const { email, name: userName } = authenticatedUser;
    const code = randomstring.generate({ length: 6, charset: "numeric" });
    const hashedCode = await bcrypt.hash(code, 6);
    const token = jwt.sign(
      {
        id: authenticatedUser.id,
        verificationCode: hashedCode,
      },
      secretKey,
      { expiresIn: "60s" }
    );
    await helperFunction.loginVerificationMail({ email, userName, code });
    res.status(200).json({
      message: "Verification mail sent!",
      userId: authenticatedUser.id.toString(),
      verificationtoken: token,
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
    let id, decodedCode;
    const decodedToken = jwt.verify(token, secretKey);
    id = decodedToken.id;
    decodedCode = decodedToken.verificationCode;
    const user = await User.findOne({ where: { id } });
    if (!user) {
      const error = new Error(`A user with this ${id} not found.`);
      error.statusCode = 401;
      throw error;
    }
    let verified = await bcrypt.compare(OTP, decodedCode);
    if (!verified) {
      return res.status(406).json({
        message: `Wrong OTP ! Please enter valid OTP!`,
      });
    }
    const authToken = jwt.sign(
      {
        UserId: user.id,
        email: user.email,
      },
      secretKey,
      { expiresIn: "3h" }
    );
    return res.status(200).json({
      message: `User Loggedin Successfully!!`,
      authToken,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.resetPasswordLink = async (req, res, next) => {
  const { email } = req.body;
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
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error(`A user with this ${email} not found.`);
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      secretKey,
      { expiresIn: "2m" }
    );
    await helperFunction.resetPasswordMail({ email, token });
    res.status(200).json({
      message: "Reset Password link sent to mail!!",
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
    id = decodedToken.userId;
    email = decodedToken.email;
    const user = await User.findOne({ where: { id, email } });
    if (!user) {
      const error = new Error(`A user with this ${email} not found.`);
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
    id = decodedToken.userId;
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
