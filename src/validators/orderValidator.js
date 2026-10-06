const { z } = require('zod');

const orderItemSchema = z.object({
  productId: z.string().length(24, "Invalid product ID"),
  sku: z.string().min(2).max(50),
  quantity: z.number().int().min(1)
});

const customerDetailsSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/, "Please provide a valid phone number"),
  address: z.string().min(5).max(500)
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  paymentMethod: z.enum(["PAYHERE", "WHATSAPP"]),
  customerDetails: customerDetailsSchema
});

module.exports = {
  createOrderSchema
};
