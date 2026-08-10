const asyncHandler = require("../utils/asyncHandler");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// ================== TOGGLE WISHLIST ================== //
// POST /api/wishlist/:productId
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // ✅ Check product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // 🧾 Find or create wishlist
  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user._id,
      products: [productId],
    });

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });
  }

  // 🔁 Toggle logic
  const index = wishlist.products.indexOf(productId);

  if (index > -1) {
    // ❌ Remove
    wishlist.products.splice(index, 1);

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist,
    });
  } else {
    // ➕ Add
    wishlist.products.push(productId);

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      wishlist,
    });
  }
});

// ================== GET WISHLIST ================== //
// GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products",
  );

  res.status(200).json({
    success: true,
    count: wishlist?.products.length || 0,
    wishlist: wishlist || { products: [] },
  });
});

// ================== REMOVE ITEM ================== //
// DELETE /api/wishlist/:productId
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    res.status(404);
    throw new Error("Wishlist not found");
  }

  wishlist.products = wishlist.products.filter(
    (item) => item.toString() !== productId,
  );

  await wishlist.save();

  res.status(200).json({
    success: true,
    message: "Product removed from wishlist",
    wishlist,
  });
});

module.exports = {
  toggleWishlist,
  getWishlist,
  removeFromWishlist,
};
