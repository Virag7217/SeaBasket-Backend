const express = require("express");

const middleware = require("../middleware/validator");
const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", middleware.SignupEmailValidator, authController.signup);

router.post("/login", middleware.loginEmailValidator, authController.login);

module.exports = router;
