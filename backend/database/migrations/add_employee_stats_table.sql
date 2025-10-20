-- Migration: Add employee_stats table for cumulative statistics
USE loftbarber;

CREATE TABLE IF NOT EXISTS employee_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    -- Daily stats (reset to 0 every day at 00:00:00)
    daily_total_packages INT DEFAULT 0,
    daily_total_clients INT DEFAULT 0,
    daily_total_revenue DECIMAL(10,2) DEFAULT 0.00,
    daily_commission DECIMAL(10,2) DEFAULT 0.00,
    -- Weekly stats (reset to 0 every Sunday at 00:00:00)
    weekly_total_packages INT DEFAULT 0,
    weekly_total_clients INT DEFAULT 0,
    weekly_total_revenue DECIMAL(10,2) DEFAULT 0.00,
    weekly_commission DECIMAL(10,2) DEFAULT 0.00,
    -- Monthly stats (cumulative, never reset automatically)
    monthly_total_packages INT DEFAULT 0,
    monthly_total_clients INT DEFAULT 0,
    monthly_total_revenue DECIMAL(10,2) DEFAULT 0.00,
    monthly_commission DECIMAL(10,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee (employee_id)
);

-- Create indexes for better performance
CREATE INDEX idx_employee_stats_employee_id ON employee_stats(employee_id);
CREATE INDEX idx_employee_stats_last_updated ON employee_stats(last_updated);
