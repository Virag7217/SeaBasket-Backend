const sequelize = require("../utility/database");
const { Op, where } = require("sequelize");
const bcrypt = require("bcryptjs");

const Product = require("../models/product");
const Rating = require("../models/rating");
const User = require("../models/user");
const Review = require("../models/review");
const ProductDetails = require("../models/product-details");

exports.products = async (req, res, next) => {
  try {
    const totalProducts = await Product.count();
    const products = await Product.findAll({
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "saleCount",
          "category",
          "productDetailId",
        ],
      },
    });
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

exports.productDetail = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: ProductDetails,
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: Review,
          attributes: ["review", "image"],
          include: [
            {
              model: Rating,
              attributes: ["rating"],
              include: [
                {
                  model: User,
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt", "saleCount", "productDetailId"],
      },
    });

    res.status(200).json({
      message: "Product fetched!",
      product: product,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.listOfCategories = async (req, res, next) => {
  try {
    const categories = await Product.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("category")), "category"],
      ],
    });
    const listOfCategories = [
      ...new Set(categories.map((product) => product.category)),
    ];
    res.status(200).json({
      message: "Fetched All Categories",
      categories: listOfCategories,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.trendingProducts = async (req, res, next) => {
  try {
    const trendingProducts = await Product.findAll({
      order: [["saleCount", "DESC"]],
      limit: 10,
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "saleCount",
          "avgRating",
          "productDetailId",
        ],
      },
    });
    res.status(200).json({ trendingProducts });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.sortingProducts = async (req, res, next) => {
  const { sort, order } = req.query;
  let sortBy;
  switch (sort) {
    case "price":
      sortBy = "price";
      break;
    case "name":
      sortBy = "name";
      break;
    default:
      sortBy = "id";
  }

  let sortingOrder;
  switch (order) {
    case "desc":
      sortingOrder = "DESC";
      break;
    default:
      sortingOrder = "ASC";
  }
  try {
    const totalProducts = await Product.count();
    const products = await Product.findAll({
      order: [[sortBy, sortingOrder]],
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "saleCount",
          "category",
          "productDetailId",
        ],
      },
    });
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

exports.search = async (req, res, next) => {
  const { name, category } = req.query;
  const where = {};
  if (name) {
    where.name = {
      [Op.substring]: name,
    };
  }
  if (category) {
    where.category = category;
  }
  try {
    const products = await Product.findAll({
      where,
      attributes: {
        exclude: [
          "createdAt",
          "updatedAt",
          "saleCount",
          "category",
          "productDetailId",
        ],
      },
    });
    res.status(200).json({ products });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.filter = async (req, res, next) => {
  const { minPrice, maxPrice, category } = req.query;
  const where = {};
  if (minPrice && maxPrice) {
    where.price = { [Op.between]: [minPrice, maxPrice] };
  }
  if (category) {
    where.category = category;
  }
  try {
    const filteredProducts = await Product.findAll({ where });
    res.json(filteredProducts);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};




