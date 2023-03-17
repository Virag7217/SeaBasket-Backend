const Product = require("../models/product");

exports.products = async (req, res, next) => {
  const currentPage = 1;
  const perPage = 12;
  const offset = (currentPage - 1) * perPage;
  try {
    const totalProducts = await Product.count();
    const products = await Product.findAll({ limit: perPage, offset });
    res.status(200).json({
      message: "Fetched All Products",
      totalProducts: totalProducts,
      products: products,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
