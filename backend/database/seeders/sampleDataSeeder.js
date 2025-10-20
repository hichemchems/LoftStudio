const bcrypt = require('bcryptjs');
const { User, Employee, Sale, Receipt, Expense, Package } = require('../../models');
const { sequelize } = require('../../models');

async function seedSampleData() {
  try {
    console.log('Starting sample data seeding...');

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // 1. Create admin user
      console.log('Creating admin user...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        username: 'admin',
        email: 'admin@loftbarber.com',
        password_hash: adminPassword,
        role: 'admin',
        is_active: true
      }, { transaction });

      // 2. Create employee users
      console.log('Creating employee users...');
      const employeeUsers = [];
      const employeeData = [
        { username: 'john', email: 'john@loftbarber.com', name: 'John Doe', percentage: 15 },
        { username: 'mike', email: 'mike@loftbarber.com', name: 'Mike Smith', percentage: 12 },
        { username: 'sarah', email: 'sarah@loftbarber.com', name: 'Sarah Johnson', percentage: 18 }
      ];

      for (const emp of employeeData) {
        const password = await bcrypt.hash('emp123', 10);
        const user = await User.create({
          username: emp.username,
          email: emp.email,
          password_hash: password,
          role: 'user',
          is_active: true,
          created_by: admin.id
        }, { transaction });

        employeeUsers.push({ ...emp, user });
      }

      // 3. Create employees
      console.log('Creating employees...');
      const employees = [];
      for (const emp of employeeUsers) {
        const employee = await Employee.create({
          user_id: emp.user.id,
          name: emp.name,
          position: 'Barber',
          hire_date: new Date(2024, 0, 15), // January 15, 2024
          percentage: emp.percentage,
          selected_package_id: 1 // Barbe package
        }, { transaction });
        employees.push(employee);
      }

      // 4. Get packages
      const packages = await Package.findAll({ transaction });
      console.log(`Found ${packages.length} packages`);

      // 5. Create sales for the last 30 days
      console.log('Creating sales data...');
      const salesData = [];
      const now = new Date();

      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Random number of sales per day (0-5)
        const numSales = Math.floor(Math.random() * 6);

        for (let j = 0; j < numSales; j++) {
          const employee = employees[Math.floor(Math.random() * employees.length)];
          const package = packages[Math.floor(Math.random() * packages.length)];

          salesData.push({
            employee_id: employee.id,
            package_id: package.id,
            client_name: `Client ${i}-${j}`,
            amount: package.price,
            date: date.toISOString().split('T')[0],
            description: `Service ${package.name}`
          });
        }
      }

      // Insert sales in batches
      for (const sale of salesData) {
        await Sale.create(sale, { transaction });
      }
      console.log(`Created ${salesData.length} sales`);

      // 6. Create receipts for the last 30 days
      console.log('Creating receipts data...');
      const receiptsData = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Random number of receipts per day (0-3)
        const numReceipts = Math.floor(Math.random() * 4);

        for (let j = 0; j < numReceipts; j++) {
          const employee = employees[Math.floor(Math.random() * employees.length)];
          const amount = Math.floor(Math.random() * 50) + 10; // 10-60€

          receiptsData.push({
            employee_id: employee.id,
            client_name: `Client Receipt ${i}-${j}`,
            amount: amount,
            date: date.toISOString().split('T')[0],
            description: 'Additional service'
          });
        }
      }

      // Insert receipts in batches
      for (const receipt of receiptsData) {
        await Receipt.create(receipt, { transaction });
      }
      console.log(`Created ${receiptsData.length} receipts`);

      // 7. Create expenses for the last 30 days
      console.log('Creating expenses data...');
      const expenseCategories = ['Rent', 'Electricity', 'Supplies', 'Marketing', 'Maintenance'];
      const expensesData = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Random number of expenses per day (0-2)
        const numExpenses = Math.floor(Math.random() * 3);

        for (let j = 0; j < numExpenses; j++) {
          const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
          let amount;

          // Different amount ranges based on category
          switch (category) {
            case 'Rent':
              amount = 500; // Monthly rent
              break;
            case 'Electricity':
              amount = Math.floor(Math.random() * 100) + 50; // 50-150€
              break;
            case 'Supplies':
              amount = Math.floor(Math.random() * 200) + 20; // 20-220€
              break;
            case 'Marketing':
              amount = Math.floor(Math.random() * 150) + 30; // 30-180€
              break;
            case 'Maintenance':
              amount = Math.floor(Math.random() * 300) + 50; // 50-350€
              break;
            default:
              amount = Math.floor(Math.random() * 100) + 20;
          }

          expensesData.push({
            category: category,
            amount: amount,
            date: date.toISOString().split('T')[0],
            description: `${category} expense`,
            created_by: admin.id
          });
        }
      }

      // Insert expenses in batches
      for (const expense of expensesData) {
        await Expense.create(expense, { transaction });
      }
      console.log(`Created ${expensesData.length} expenses`);

      // Commit transaction
      await transaction.commit();

      console.log('Sample data seeding completed successfully!');
      console.log('Summary:');
      console.log(`- Created 1 admin user`);
      console.log(`- Created ${employeeUsers.length} employee users`);
      console.log(`- Created ${employees.length} employees`);
      console.log(`- Created ${salesData.length} sales`);
      console.log(`- Created ${receiptsData.length} receipts`);
      console.log(`- Created ${expensesData.length} expenses`);

      console.log('\nLogin credentials:');
      console.log('Admin: admin@loftbarber.com / admin123');
      console.log('Employees: [username]@loftbarber.com / emp123');

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  sequelize.authenticate()
    .then(() => {
      console.log('Database connected');
      return seedSampleData();
    })
    .then(() => {
      console.log('Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSampleData };
