const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Product Variant Schema
|--------------------------------------------------------------------------
*/

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      uppercase: true,
      minlength: [2, "SKU must be at least 2 characters"],
      maxlength: [50, "SKU cannot exceed 50 characters"],
    },

    size: {
      type: String,
      required: [true, "Size is required"],
      trim: true,
      uppercase: true,
      maxlength: [20, "Size cannot exceed 20 characters"],
    },

    color: {
      type: String,
      required: [true, "Color is required"],
      trim: true,
      maxlength: [50, "Color cannot exceed 50 characters"],
    },

    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
      default: 0,
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| Product Schema
|--------------------------------------------------------------------------
*/

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [180, "Product slug cannot exceed 180 characters"],
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers and hyphens",
      ],
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },

    subcategory: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0.01, "Price must be greater than 0"],
      validate: {
        validator: Number.isFinite,
        message: "Price must be a valid number",
      },
    },

    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: [
        {
          validator: function (images) {
            return images.length >= 1;
          },
          message: "Product must have at least one image",
        },
        {
          validator: function (images) {
            return images.every((image) => {
              return /^https?:\/\/.+/i.test(image);
            });
          },
          message: "All images must be valid URLs",
        },
      ],
    },

    variants: {
      type: [variantSchema],
      required: [true, "Product variants are required"],
      validate: {
        validator: function (variants) {
          return variants.length >= 1;
        },
        message: "Product must have at least one variant",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

// Fast product slug lookup
productSchema.index(
  { slug: 1 },
  {
    unique: true,
    name: "unique_product_slug",
  }
);

// Product browsing/filtering
productSchema.index(
  { category: 1, isActive: 1 },
  {
    name: "product_category_active",
  }
);

// Product search
productSchema.index(
  {
    name: "text",
    description: "text",
  },
  {
    name: "product_text_search",
  }
);

// Price filtering
productSchema.index(
  { price: 1 },
  {
    name: "product_price",
  }
);

// Variant SKU lookup
productSchema.index(
  { "variants.sku": 1 },
  {
    name: "product_variant_sku",
  }
);

// Variant filtering
productSchema.index(
  {
    "variants.size": 1,
    "variants.color": 1,
  },
  {
    name: "product_variant_size_color",
  }
);

/*
|--------------------------------------------------------------------------
| Product Validation
|--------------------------------------------------------------------------
*/

/**
 * Make sure SKUs are unique inside a product.
 */
productSchema.pre("validate", function () {
  const skus = this.variants.map((variant) => variant.sku);

  const uniqueSkus = new Set(skus);

  if (skus.length !== uniqueSkus.size) {
    throw new Error("Each product variant must have a unique SKU");
  }
});

/*
|--------------------------------------------------------------------------
| Virtual: Total Stock
|--------------------------------------------------------------------------
*/

productSchema.virtual("totalStock").get(function () {
  return this.variants.reduce(
    (total, variant) => total + variant.stock,
    0
  );
});

/*
|--------------------------------------------------------------------------
| JSON Settings
|--------------------------------------------------------------------------
*/

productSchema.set("toJSON", {
  virtuals: true,
});

productSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("Product", productSchema);
