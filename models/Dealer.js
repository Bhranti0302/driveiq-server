const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const dealerSchema = new mongoose.Schema(
  {
    // Dealer contact person
    name: {
      type: String,
      required: [true, "Dealer name is required"],
      trim: true,
      minlength: [5, "Minimum 5 characters are required"],
      maxlength: [100, "Maximum 100 characters allowed"],
    },

    // Login credentials
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Minimum 8 characters are required"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
      ],
      select: false,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please provide a valid 10-digit Indian mobile number",
      ],
    },

    // Business information
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      minlength: [2, "Business name must contain at least 2 characters"],
      maxlength: [150, "Business name cannot exceed 150 characters"],
    },

    businessType: {
      type: String,
      enum: ["company", "independent"],
      required: [true, "Business type is required"],
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
        "Please provide a valid GST number",
      ],
    },

    registrationNumber: {
      type: String,
      trim: true,
    },

    // Business address
    businessAddress: {
      addressLine: {
        type: String,
        required: [true, "Business address is required"],
        trim: true,
      },

      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },

      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },

      postalCode: {
        type: String,
        required: [true, "Postal code is required"],
        trim: true,
      },

      country: {
        type: String,
        required: [true, "Country is required"],
        default: "India",
        trim: true,
      },
    },

    // Business logo
    logo: {
      type: String,
      default: "",
    },

    logoPublicId: {
      type: String,
      default: "",
    },

    // Business verification documents
    documents: [
      {
        documentType: {
          type: String,
          enum: [
            "gst",
            "business-registration",
            "identity",
            "address-proof",
            "other",
          ],
          required: true,
        },

        documentUrl: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Admin approval
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
dealerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password during login
dealerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Dealer = mongoose.model("Dealer", dealerSchema);

module.exports = Dealer;
