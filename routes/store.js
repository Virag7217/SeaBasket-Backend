const express = require("express");

const storeController = require("../controllers/store");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/product", storeController.products);

router.get("/product/:productId", storeController.productDetail);

router.get("/trending-products", storeController.trendingProducts);

router.get("/categories", storeController.listOfCategories);

router.get("/sorted-product", storeController.sortingProducts);

router.get("/filter", storeController.filter);

router.get("/search", storeController.search);

router.get("/cart", isAuth, storeController.getCart);

router.post("/cart", isAuth, storeController.addToCart);


module.exports = router;
