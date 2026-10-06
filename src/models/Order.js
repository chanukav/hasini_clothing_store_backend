const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Order Item Schema
|--------------------------------------------------------------------------
*/

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },

    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },

    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      uppercase: true,
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

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },

    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0.01, "Unit price must be greater than 0"],
      validate: {
        validator: Number.isFinite,
        message: "Unit price must be a valid number",
      },
    },

    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0.01, "Subtotal must be greater than 0"],
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Customer Details Schema
|--------------------------------------------------------------------------
| Snapshot customer information at the time of ordering.
*/

const customerDetailsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Customer name must be at least 2 characters"],
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Customer email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    phone: {
      type: String,
      required: [true, "Customer phone number is required"],
      trim: true,
      match: [
        /^\+?[0-9]{9,15}$/,
        "Please provide a valid phone number",
      ],
    },

    address: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters"],
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Order Schema
|--------------------------------------------------------------------------
*/

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      immutable: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer reference is required"],
    },

    customerDetails: {
      type: customerDetailsSchema,
      required: [true, "Customer details are required"],
    },

    items: {
      type: [orderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: function (items) {
          return items.length >= 1;
        },
        message: "Order must contain at least one item",
      },
    },

    subtotal: {
      type: Number,
      required: [true, "Order subtotal is required"],
      min: [0.01, "Subtotal must be greater than 0"],
    },

    total: {
      type: Number,
      required: [true, "Order total is required"],
      min: [0.01, "Total must be greater than 0"],
    },

    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["PAYHERE", "WHATSAPP"],
        message: "Payment method must be PAYHERE or WHATSAPP",
      },
    },

    paymentStatus: {
      type: String,
      enum: {
        values: [
          "PENDING",
          "PAID",
          "FAILED",
          "CANCELLED",
        ],
        message: "Invalid payment status",
      },
      default: "PENDING",
    },

    orderStatus: {
      type: String,
      enum: {
        values: [
          "PENDING",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
        ],
        message: "Invalid order status",
      },
      default: "PENDING",
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

// Unique order number
orderSchema.index(
  { orderNumber: 1 },
  {
    unique: true,
    name: "unique_order_number",
  }
);

// Customer's order history
orderSchema.index(
  { customer: 1, createdAt: -1 },
  {
    name: "customer_orders",
  }
);

// Admin order management
orderSchema.index(
  { orderStatus: 1, createdAt: -1 },
  {
    name: "order_status_date",
  }
);

// Payment management
orderSchema.index(
  { paymentStatus: 1, createdAt: -1 },
  {
    name: "payment_status_date",
  }
);

// Payment method filtering
orderSchema.index(
  { paymentMethod: 1, createdAt: -1 },
  {
    name: "payment_method_date",
  }
);

/*
|--------------------------------------------------------------------------
| Order Validation
|--------------------------------------------------------------------------
*/

/**
 * Validate item subtotal.
 *
 * subtotal = quantity × unitPrice
 */
orderSchema.pre("validate", function (next) {
  for (const item of this.items) {
    const calculatedSubtotal =
      item.quantity * item.unitPrice;

    // Round to 2 decimal places
    const expectedSubtotal =
      Math.round(calculatedSubtotal * 100) / 100;

    const actualSubtotal =
      Math.round(item.subtotal * 100) / 100;

    if (expectedSubtotal !== actualSubtotal) {
      return next(
        new Error(
          `Invalid subtotal for product ${item.productName}`
        )
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Validate order subtotal
  |--------------------------------------------------------------------------
  */

  const calculatedSubtotal = this.items.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  const expectedSubtotal =
    Math.round(calculatedSubtotal * 100) / 100;

  const actualSubtotal =
    Math.round(this.subtotal * 100) / 100;

  if (expectedSubtotal !== actualSubtotal) {
    return next(
      new Error("Order subtotal does not match order items")
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate total
  |--------------------------------------------------------------------------
  |
  | Currently:
  |
  | total = subtotal
  |
  | You can later add:
  |
  | shipping
  | discounts
  | tax
  |
  */

  const expectedTotal = expectedSubtotal;

  const actualTotal =
    Math.round(this.total * 100) / 100;

  if (expectedTotal !== actualTotal) {
    return next(
      new Error("Order total does not match order subtotal")
    );
  }

  next();
});

/*
|--------------------------------------------------------------------------
| Order Number Generator
|--------------------------------------------------------------------------
*/

orderSchema.statics.generateOrderNumber =
  async function () {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const prefix = `ORD-${year}${month}${day}`;

    const latestOrder = await this.findOne({
      orderNumber: {
        $regex: `^${prefix}-`,
      },
    })
      .sort({ createdAt: -1 })
      .select("orderNumber");

    let sequence = 1;

    if (latestOrder) {
      const lastSequence =
        parseInt(
          latestOrder.orderNumber.split("-").pop(),
          10
        ) || 0;

      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, "0")}`;
  };

module.exports = mongoose.model(
  "Order",
  orderSchema
);
