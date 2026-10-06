# Hasini Clothing Store - Project Plan

## Customer User Flow
1. **Home**: Landing page featuring new arrivals, categories, and promotions.
2. **Shop**: Browse all products with pagination.
3. **Search / Filter**: Filter by category, price range, size, color, or search by keyword.
4. **Product Details**: View product images, description, price, available sizes, and colors.
5. **Select Size + Color**: Choose product variants (size and color combination).
6. **Add to Cart**: Add the selected variant to the shopping cart.
7. **Cart**: Review items, update quantities, or remove items. Proceed to checkout.
8. **Checkout**: Enter shipping details, billing information, and choose payment method.
   - **PayHere**: Online payment gateway for secure credit/debit card transactions.
   - **WhatsApp**: Offline/manual order placement via WhatsApp message.
9. **Order Confirmation**: Display order summary and order ID.

## Admin User Flow
1. **Admin Login**: Secure login for store administrators.
2. **Dashboard**: Overview of key metrics (sales, low stock, recent orders).
   - **Products**: Add, edit, or delete products and their variants (sizes, colors, images, prices).
   - **Inventory**: Monitor and adjust stock levels for specific product variants.
   - **Orders**: View, manage, and update the status of customer orders.

## Order Lifecycle
1. **Pending**: Order placed, waiting for payment confirmation (or waiting for WhatsApp confirmation).
2. **Processing**: Payment confirmed, order is being packed and prepared for shipment.
3. **Shipped**: Order handed over to the courier/delivery service.
4. **Delivered**: Order successfully received by the customer.
5. **Cancelled/Refunded**: Order cancelled by customer or admin, payment refunded if applicable.

## Payment Lifecycle
1. **Initiated**: Customer selects payment method and initiates transaction.
2. **Authorized (PayHere)**: Payment gateway authorizes the transaction.
3. **Completed**: Funds successfully captured (Order moves to Processing).
4. **Failed**: Payment declined or error occurred (Order remains Pending/Cancelled).
5. **Manual Verification (WhatsApp)**: Admin manually verifies bank transfer/cash payment and marks as Completed.

## Product Variant Structure
- **Product ID**: Unique identifier for the base product.
- **Title**: Name of the product (e.g., "Floral Summer Dress").
- **Description**: Detailed product description.
- **Base Price**: Default price (can be overridden by variants).
- **Category**: E.g., Dresses, Tops, Accessories.
- **Variants**: An array of specific combinations:
  - `Variant ID`: Unique identifier for the combination.
  - `Size`: E.g., S, M, L, XL.
  - `Color`: E.g., Red, Blue, Black.
  - `SKU`: Stock Keeping Unit.
  - `Price Override`: (Optional) If a specific variant costs more.
  - `Stock Quantity`: Available inventory for this exact size/color combination.

## Inventory Rules
- Stock is tracked at the **Variant** level, not the base product level.
- When an item is added to the cart, stock is *not* reserved.
- Stock is deducted only upon **successful order placement** (Payment Completed or WhatsApp order initiated).
- If an order is cancelled or refunded, the stock is added back to the inventory.
- Low stock threshold (e.g., < 5 items) triggers an alert in the Admin Dashboard.
- Out-of-stock variants cannot be added to the cart (UI displays "Out of Stock").

## WhatsApp Order Format
When a customer chooses to checkout via WhatsApp, a pre-filled message is generated and sent to the store's business number.

**Format:**
```text
Hello Hasini Clothing Store! I would like to place an order.

*Order Details:*
1x Floral Summer Dress (Size: M, Color: Red) - Rs. 2,500
2x Basic Cotton T-Shirt (Size: L, Color: Black) - Rs. 3,000

*Subtotal:* Rs. 5,500
*Shipping:* Rs. 350
*Total:* Rs. 5,850

*Shipping Information:*
Name: Jane Doe
Address: 123 Main St, Colombo 03
Phone: 077 123 4567

Please let me know the bank details to proceed with the payment. Thank you!
```
