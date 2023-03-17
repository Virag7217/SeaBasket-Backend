const { body } = require("express-validator/check");
const User = require("../models/user");

exports.signupValidator = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, { req }) => {
      return User.findOne({ where: { email: value } }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject(`${value} already exists!`);
        }
      });
    })
    .normalizeEmail(),
  body("password").trim().isLength({ min: 5 }),
  body("name").trim().not().isEmpty(),
];

exports.emailValidator = [body("email").isEmail().normalizeEmail()];

exports.loginValidator = [body("emailOrPhoneNo").isEmail().normalizeEmail()];

exports.passwordValidator = [body("newPassword").trim().isLength({ min: 5 })];
