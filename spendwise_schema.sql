-- ============================================================
-- SpendWise Personal Finance Database Schema (MySQL 8.0+)
-- Tagline: Spend Smart • Save More • Live Better
-- ============================================================

CREATE DATABASE IF NOT EXISTS `spendwise_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `spendwise_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'INR',
  `theme` VARCHAR(10) DEFAULT 'dark',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Salary / Monthly Income Table
CREATE TABLE IF NOT EXISTS `salary_income` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `month` VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  `monthly_salary` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `other_income` DECIMAL(12,2) DEFAULT 0.00,
  `income_source` VARCHAR(100) DEFAULT 'Primary Salary',
  `salary_date` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Bank Accounts Table
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('checking', 'savings', 'credit', 'investment', 'cash') DEFAULT 'checking',
  `institution` VARCHAR(100) NOT NULL,
  `account_number` VARCHAR(30),
  `balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `color` VARCHAR(20) DEFAULT '#3B82F6',
  `is_synced` BOOLEAN DEFAULT TRUE,
  `last_synced_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Expense Categories Table
CREATE TABLE IF NOT EXISTS `expense_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `color` VARCHAR(20) DEFAULT '#10B981',
  `icon` VARCHAR(50) DEFAULT 'Tag'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Monthly Budgets Table
CREATE TABLE IF NOT EXISTS `monthly_budgets` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `limit_amount` DECIMAL(12,2) NOT NULL,
  `period` VARCHAR(20) DEFAULT 'monthly',
  `color` VARCHAR(20) DEFAULT '#8B5CF6',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Transactions Table
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `account_id` VARCHAR(64) NOT NULL,
  `target_account_id` VARCHAR(64) NULL,
  `title` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `type` ENUM('income', 'expense', 'transfer') NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `merchant` VARCHAR(100),
  `notes` TEXT,
  `status` VARCHAR(20) DEFAULT 'cleared',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Savings Goals Table
CREATE TABLE IF NOT EXISTS `savings_goals` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `target_amount` DECIMAL(12,2) NOT NULL,
  `current_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `deadline` DATE,
  `category` VARCHAR(50) DEFAULT 'General',
  `color` VARCHAR(20) DEFAULT '#10B981',
  `icon` VARCHAR(50) DEFAULT 'PiggyBank',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Recurring Bills Table
CREATE TABLE IF NOT EXISTS `recurring_bills` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `billing_cycle` VARCHAR(20) DEFAULT 'monthly',
  `category` VARCHAR(50) NOT NULL,
  `next_due_date` DATE NOT NULL,
  `account_id` VARCHAR(64),
  `status` VARCHAR(20) DEFAULT 'active',
  `auto_pay` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Notifications & Expenditure Alerts Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `type` VARCHAR(50) DEFAULT 'budget_alert',
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `month` VARCHAR(7),
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Categories
INSERT INTO `expense_categories` (`name`, `color`, `icon`) VALUES
('Food', '#10B981', 'Utensils'),
('Travel', '#3B82F6', 'Car'),
('Bills', '#8B5CF6', 'FileText'),
('Shopping', '#EC4899', 'ShoppingBag'),
('Health', '#EF4444', 'Activity'),
('Others', '#F59E0B', 'MoreHorizontal')
ON DUPLICATE KEY UPDATE `color`=VALUES(`color`);
