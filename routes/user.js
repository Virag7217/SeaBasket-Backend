const express = require("express");

const middleware = require("../middleware/validator");
const authController = require("../controllers/user");

const router = express.Router();

router.post("/signup", middleware.signupValidator, authController.signup);

router.post("/login", authController.login);

router.post("/login/:token", authController.loginVerification);

router.post(
  "/forgot-password",
  middleware.emailValidator,
  authController.resetPasswordLink
);

router.get("/password-reset/:token", authController.ResetPasswordPage);

router.post(
  "/password-reset/:token",
  middleware.passwordValidator,
  authController.updatePassword
);

module.exports = router;
