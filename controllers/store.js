const Product = require("../models/product");
const Rating = require("../models/rating");
const User = require("../models/user");

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

exports.product = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Rating,
          attributes: ["id", "rating"],
          include: [
            {
              model: User,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });
    res.status(200).json({
      message: "Fetched Product",
      products: product,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
