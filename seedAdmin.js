require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hasaniclothing.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'Store Administrator';
  const adminPhone = process.env.ADMIN_PHONE || '+94771234567';

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // Check if admin already exists
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Admin user with email "${adminEmail}" already exists.`);
      console.log('Updating password and role to SUPER_ADMIN...');
      admin.password = adminPassword; // Will be hashed by pre-save hook
      admin.role = 'SUPER_ADMIN';
      admin.isActive = true;
      admin.name = adminName;
      admin.phone = adminPhone;
      await admin.save();
      console.log('Admin user updated successfully.');
    } else {
      admin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        phone: adminPhone,
        role: 'SUPER_ADMIN',
        isActive: true,
      });

      await admin.save();
      console.log('New Admin user created successfully.');
    }

    console.log('-------------------------------------------');
    console.log('Admin Credentials:');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     SUPER_ADMIN`);
    console.log('-------------------------------------------');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
};

seedAdmin();
