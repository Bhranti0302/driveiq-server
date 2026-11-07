const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    products: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],
      default: [],
      validate: {
        validator: function (products) {
          const ids = products.map((id) => id.toString());
          return ids.length === new Set(ids).size;
        },
        message: "Duplicate products are not allowed in wishlist",
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
