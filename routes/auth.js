const express = require("express");

const middleware = require("../middleware/validator");
const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", middleware.emailValidator, authController.signup);

module.exports = router;
