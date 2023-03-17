const express = require("express");

const storeController = require("../controllers/store");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/", storeController.products);

module.exports = router;
