const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [150, "Email cannot exceed 150 characters"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^\+?[0-9]{9,15}$/,
        "Please provide a valid phone number",
      ],
    },

    role: {
      type: String,
      enum: {
        values: ["CUSTOMER", "ADMIN", "SUPER_ADMIN"],
        message: "Role must be CUSTOMER, ADMIN, or SUPER_ADMIN",
      },
      default: "CUSTOMER",
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

// Unique email lookup
userSchema.index(
  { email: 1 },
  {
    unique: true,
    name: "unique_user_email",
  }
);

// Useful for admin user management
userSchema.index(
  { role: 1, isActive: 1 },
  {
    name: "user_role_status",
  }
);

/*
|--------------------------------------------------------------------------
| Password Hashing
|--------------------------------------------------------------------------
*/

userSchema.pre("save", async function () {
  // Only hash password when it is modified
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/*
|--------------------------------------------------------------------------
| Password Comparison
|--------------------------------------------------------------------------
*/

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/*
|--------------------------------------------------------------------------
| JSON Transformation
|--------------------------------------------------------------------------
| Prevent password from accidentally appearing in API responses.
*/

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;

  return user;
};

module.exports = mongoose.model("User", userSchema);
