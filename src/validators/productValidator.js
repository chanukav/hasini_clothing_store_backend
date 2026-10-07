const { z } = require('zod');

const variantSchema = z.object({
  sku: z.string().min(2).max(50),
  size: z.string().max(20),
  color: z.string().max(50),
  stock: z.number().int().min(0).default(0)
});

const createProductSchema = z.object({
  name: z.string().min(2).max(150),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  description: z.string().min(10).max(5000),
  category: z.string().max(100),
  subcategory: z.string().optional(),
  price: z.number().min(0.01),
  images: z.array(z.string().url()).min(1),
  variants: z.array(variantSchema).min(1),
  isActive: z.boolean().optional()
});

const updateProductSchema = createProductSchema.partial();

module.exports = {
  createProductSchema,
  updateProductSchema
};
