CREATE DATABASE IF NOT EXISTS itsm;
USE itsm;

-- =========================
-- Departments
-- =========================
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  UNIQUE KEY unique_dept_name (name)  -- ✅ UNIQUE to enable ON DUPLICATE KEY UPDATE
);

-- =========================
-- Users (FIXED)
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(64),

  status VARCHAR(32) DEFAULT 'active',   -- ✅ REQUIRED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- ✅ REQUIRED

  department_id INT,
  password_hash VARCHAR(255) NULL,

  FOREIGN KEY (department_id)
    REFERENCES departments(id)
    ON DELETE SET NULL
);

-- =========================
-- Assets
-- =========================
CREATE TABLE IF NOT EXISTS assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  serialNumber VARCHAR(255),
  type VARCHAR(128),
  status VARCHAR(32) DEFAULT 'available',
  department VARCHAR(255),
  purchaseDate DATE,
  warrantyExpiry DATE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_asset_serialNumber (serialNumber)  -- ✅ UNIQUE to enable ON DUPLICATE KEY UPDATE
);

-- =========================
-- Assignments
-- =========================
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_by INT,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  returned_at DATETIME NULL,
  notes TEXT,

  FOREIGN KEY (asset_id)
    REFERENCES assets(id)
    ON DELETE CASCADE,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  FOREIGN KEY (assigned_by)
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- =========================
-- Issues
-- =========================
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT,
  user_id INT,
  description TEXT,
  priority VARCHAR(32) DEFAULT 'medium',
  status VARCHAR(32) DEFAULT 'pending',
  admin_remarks TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (asset_id)
    REFERENCES assets(id)
    ON DELETE SET NULL,

  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- =========================
-- Sample Data
-- =========================
INSERT INTO departments (name)
VALUES ('IT'), ('HR'), ('Finance')
ON DUPLICATE KEY UPDATE name = VALUES(name);
INSERT INTO departments (name)
VALUES
('Operations'),
('Marketing')
ON DUPLICATE KEY UPDATE name = VALUES(name);



INSERT INTO users (name, email, role, department_id, password_hash)
VALUES
('Admin User', 'admin@company.com', 'admin', 1, NULL),
('Alice Admin', 'alice@example.com', 'admin', 1, NULL),
('Bob Employee', 'bob@example.com', 'employee', 2, NULL)
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO assets (name, serialNumber, type, status, department, purchaseDate, warrantyExpiry, description)
VALUES
('Dell Latitude 5500', 'SN-ABC-001', 'laptop', 'available', 'IT', '2022-03-15', '2024-03-15', 'Portable laptop for office use'),
('HP ProDesk 400', 'SN-HP-123', 'desktop', 'available', 'IT', '2021-08-01', '2025-08-01', 'Desktop workstation')
ON DUPLICATE KEY UPDATE serialNumber = VALUES(serialNumber);

INSERT INTO assignments (asset_id, user_id, notes)
VALUES
(1, 2, 'Assigned for project X')
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

INSERT INTO issues (asset_id, user_id, description, priority, status)
VALUES
(1, 2, 'Battery stops charging below 40%', 'high', 'pending')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- =========================
-- View
-- =========================
CREATE OR REPLACE VIEW asset_status AS
SELECT
  a.id AS asset_id,
  a.name AS asset_name,
  a.status,
  asg.user_id,
  asg.assigned_at
FROM assets a
LEFT JOIN assignments asg
  ON asg.asset_id = a.id
  AND asg.returned_at IS NULL;