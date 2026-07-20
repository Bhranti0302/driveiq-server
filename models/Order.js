const mongoose = require("mongoose");

// Order Item Schema
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: String, // snapshot
    price: Number, 
    quantity: Number,
    image:String,
}, {
    _id:false
})

// Main Order Schema
const ordeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    orderItems: [orderItemSchema],
    
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
     
    status: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending"
    },

    isPaid: {
        type: Boolean,
        default: false
    },

    paidAt: {
        type: Date
    },

    shippingAddress: {
        address: String,
        city: String,
        postalCode: String,
        country: String
    },
}, {
    timestamps: true
})

module.exports = mongoose.model("Order", orderSchema)