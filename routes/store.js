const express = require("express");

const storeController = require("../controllers/store");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/products", storeController.products);

router.get('/products/:productId',storeController.product);

module.exports = router;
