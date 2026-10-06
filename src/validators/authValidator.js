const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(150),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/, "Please provide a valid phone number")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

module.exports = {
  registerSchema,
  loginSchema
};
