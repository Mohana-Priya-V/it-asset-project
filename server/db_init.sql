-- MySQL schema for IT Asset Management (import into MySQL Workbench)
-- Creates tables and inserts sample seed data

CREATE DATABASE IF NOT EXISTS itsm;
USE itsm;

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(64),
  department_id INT,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Assets
CREATE TABLE IF NOT EXISTS assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  serial VARCHAR(255),
  category VARCHAR(128),
  status VARCHAR(32) DEFAULT 'available',
  location VARCHAR(255),
  purchase_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  returned_at DATETIME NULL,
  notes TEXT,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Issues
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(32) DEFAULT 'open',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Sample data
INSERT INTO departments (name) VALUES ('IT'), ('HR'), ('Finance')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (name, email, role, department_id) VALUES
('Alice Admin', 'alice@example.com', 'admin', 1),
('Bob Employee', 'bob@example.com', 'employee', 2)
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO assets (name, serial, category, status, location, purchase_date) VALUES
('Dell Latitude 5500', 'SN-ABC-001', 'laptop', 'available', 'Office A', '2022-03-15'),
('HP ProDesk 400', 'SN-HP-123', 'desktop', 'available', 'Office B', '2021-08-01')
ON DUPLICATE KEY UPDATE serial = VALUES(serial);

INSERT INTO assignments (asset_id, user_id, assigned_at, notes) VALUES
(1, 2, NOW(), 'Assigned for project X')
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

INSERT INTO issues (asset_id, user_id, title, description, status) VALUES
(1, 2, 'Battery not charging', 'Battery stops charging when below 40%', 'open')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Simple view for quick asset + assignment lookup
CREATE OR REPLACE VIEW asset_status AS
SELECT a.id AS asset_id, a.name AS asset_name, a.status, asg.user_id, asg.assigned_at
FROM assets a
LEFT JOIN assignments asg ON asg.asset_id = a.id AND asg.returned_at IS NULL;
