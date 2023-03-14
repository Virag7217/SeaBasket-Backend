const { body } = require("express-validator/check");
const User = require("../models/user");

exports.SignupEmailValidator = [
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

exports.loginEmailValidator = [body("email").isEmail().normalizeEmail()];