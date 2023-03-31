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

router.get("/order", isAuth, storeController.orders);

router.post("/order", isAuth, storeController.postOrder);

router.get("/order/:orderId", isAuth, storeController.orderDetails);

router.post("/order/:orderId", isAuth, storeController.cancelOrder);

router.post("/buy", isAuth, storeController.buyNow);

router.get("/profile", isAuth, storeController.profile);

router.put("/profile", isAuth, storeController.updateProfile);


module.exports = router;
