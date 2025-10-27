require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, Employee } = require('../models');
const { sequelize } = require('../config/database');

async function createAdminUser() {
  try {
    console.log('🔧 Initializing admin user...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Define associations
    const { defineAssociations } = require('../models');
    defineAssociations();

    // Sync database
    await sequelize.sync();
    console.log('✅ Database synchronized.');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: {
        role: 'admin'
      }
    });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password = process.env.ADMIN_PASSWORD || 'Admin123!@#';
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const adminUser = await User.create({
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@loft-barber.com',
      password_hash: hashedPassword,
      role: 'admin',
      is_active: true
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password:', password);
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };
