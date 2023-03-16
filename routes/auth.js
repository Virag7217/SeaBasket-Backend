const express = require("express");

const middleware = require("../middleware/validator");
const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", middleware.signupValidator, authController.signup);

router.post("/login", middleware.emailValidator, authController.login);

router.post(
  "/forgot-password",
  middleware.emailValidator,
  authController.resetPasswordLink
);

router.get("/password-reset/:token", authController.ResetPasswordPage);

router.post("/password-reset/:token", middleware.passwordValidator , authController.updatePassword);

module.exports = router;
