const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Wait, user used bcryptjs but bcrypt is installed. I will use bcrypt since it is already installed.
// The user code has require("bcryptjs"), let me check package.json to see if bcrypt or bcryptjs is installed. 
// From earlier view_file, "bcrypt": "^6.0.0" is installed. I will change it to require("bcrypt").
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
        values: ["CUSTOMER", "ADMIN"],
        message: "Role must be CUSTOMER or ADMIN",
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

userSchema.pre("save", async function (next) {
  // Only hash password when it is modified
  if (!this.isModified("password")) {
    return next();
  }

  const bcrypt = require("bcrypt"); // using bcrypt instead of bcryptjs
  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/*
|--------------------------------------------------------------------------
| Password Comparison
|--------------------------------------------------------------------------
*/

userSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = require("bcrypt");
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
