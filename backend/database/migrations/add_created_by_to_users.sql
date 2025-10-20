-- Migration: Add created_by column to users table
USE loftbarber;

ALTER TABLE users ADD COLUMN created_by INT NULL AFTER is_active;
ALTER TABLE users ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_users_created_by ON users(created_by);
