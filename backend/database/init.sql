-- Initial database setup for EasyGestion
CREATE DATABASE IF NOT EXISTS loftbarber;
USE loftbarber;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('superAdmin', 'admin', 'user') NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50),
    hire_date DATE,
    deduction_percentage DECIMAL(5,2) DEFAULT 0.00,
    avatar_url VARCHAR(255),
    contract_url VARCHAR(255),
    employment_declaration_url VARCHAR(255),
    certification_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    package_id INT NOT NULL,
    client_name VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    client_name VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create salaries table
CREATE TABLE IF NOT EXISTS salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    base_salary DECIMAL(10,2) DEFAULT 0.00,
    commission_percentage DECIMAL(5,2) DEFAULT 0.00,
    total_salary DECIMAL(10,2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create admin_charges table
CREATE TABLE IF NOT EXISTS admin_charges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rent DECIMAL(10,2) DEFAULT 0.00,
    charges DECIMAL(10,2) DEFAULT 0.00,
    operating_costs DECIMAL(10,2) DEFAULT 0.00,
    electricity DECIMAL(10,2) DEFAULT 0.00,
    salaries DECIMAL(10,2) DEFAULT 0.00,
    month YEAR NOT NULL,
    year YEAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_month_year (month, year)
);

-- Insert initial packages
INSERT INTO packages (name, price, created_at, updated_at) VALUES
('Barbe', 7.00, NOW(), NOW()),
('Coupe de cheveux', 12.00, NOW(), NOW()),
('Coupe de cheveux sans contour', 16.00, NOW(), NOW()),
('Coupe de cheveux avec contour', 19.00, NOW(), NOW()),
('Coupe de cheveux enfant', 10.00, NOW(), NOW()),
('Service personnalisé', 0.00, NOW(), NOW());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_employee_date ON sales(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_receipts_employee_date ON receipts(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_salaries_employee_period ON salaries(employee_id, period_start, period_end);
