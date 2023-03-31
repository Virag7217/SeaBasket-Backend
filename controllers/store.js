const sequelize = require("../utility/database");
const { Op, where } = require("sequelize");
const bcrypt = require("bcryptjs");

const Product = require("../models/product");
const Rating = require("../models/rating");
const User = require("../models/user");
const Cart = require("../models/cart");
const Order = require("../models/order");
const Address = require("../models/address");
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

exports.getCart = async (req, res, next) => {
  const userId = req.user.UserId;
  try {
    const cart = await Cart.findOne({
      where: { userId },
      attributes: {
        exclude: ["userId"],
      },
      include: [{ model: Product }],
    });
    if (!cart || cart.products.length === 0) {
      return res.status(200).json({ message: "Your Seabasket Cart is Empty!" });
    }
    const products = cart.products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: product.cartProduct.quantity,
    }));
    const subtotal = products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
    res.json({
      cart: {
        id: cart.id,
        userId: cart.userId,
        products: products,
        Cart_Total: subtotal,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user.UserId;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const [cart] = await Cart.findOrCreate({
      where: { userId },
      defaults: { userId },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await cart.addProduct(product, {
      through: { quantity: quantity || 1 },
    });
    res.json({ message: "Product added to cart successfully", cart: cart });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postOrder = async (req, res, next) => {
  const userId = req.user.UserId;
  try {
    const user = await User.findOne({
      where: { id: userId },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    const cart = await user.getCart();
    const products = await cart.getProducts();
    const order = await user.createOrder();

    const orderData = order.addProducts(
      products.map((product) => {
        product.orderItem = { quantity: product.cartProduct.quantity };
        return product;
      })
    );
    cart.setProducts(null);

    res.status(200).json({ message: "Your Order has been placed!" }); // do something with the cart
  } catch (error) {
    console.log(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      res.status(404).json({ message: `Order ${orderId} not found` });
    }
    order.status = "canceled";
    await order.save();
    res.status(200).json({
      message: `your order ${orderId} has been canceled!`,
      orders: order,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.orders = async (req, res, next) => {
  const userId = req.user.UserId;
  try {
    const orderCount = await Order.count({ where: { userId } });
    const orders = await Order.findAll({
      where: { userId },
      include: [{ model: Product }, { model: Address }],
    });
    if (orders.length === 0) {
      return res
        .status(200)
        .json({ message: "You haven't placed any orders yet !!" });
    }

    const Orders = orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      orderDate: order.updatedAt,
      shipedTo: order.address.name,
      products: order.products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: product.orderItem.quantity,
      })),
    }));

    res.json({ totalOrders: orderCount, orders: Orders });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.orderDetails = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByPk(orderId, {
      attributes: { exclude: ["createdAt", "updatedAt", "addressId"] },
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price", "imageUrl"],
          through: { attributes: ["quantity"] },
        },
        { model: Address },
      ],
    });
    const products = order.products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: product.orderItem.quantity,
    }));
    const orderTotal = products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
    if (!order) {
      res.status(404).json({ message: `Order ${orderId} not found` });
    } else {
      res.status(200).json({ order, orderTotal });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.buyNow = async (req, res, next) => {
  const userId = req.user.UserId;
  const { productId } = req.body;
  try {
    const product = await Product.findByPk(productId, {
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
    const addresses = await Address.findAll({
      where: { userId },
      attributes: { exclude: ["createdAt", "updatedAt", "id", "userId"] },
    });
    const orderTotal = product.price;

    res.status(200).json({ orderTotal, addresses, product });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};






