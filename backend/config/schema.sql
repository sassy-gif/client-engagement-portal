CREATE DATABASE IF NOT EXISTS origami_ces;
USE origami_ces;

-- Users: Admin, Team Member, Client login accounts
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'team_member', 'client') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clients: the companies Origami serves
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  company_name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(150),
  contact_email VARCHAR(150),
  contact_phone VARCHAR(50),
  logo_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Projects: engagements tied to a client
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  service_type ENUM(
    'social_media_management',
    'operational_improvement',
    'branding_coaching',
    'sponsorship_partnership',
    'website_development',
    'ongoing_consulting'
  ) NOT NULL,
  progress_mode ENUM('milestone', 'ongoing', 'hybrid') NOT NULL DEFAULT 'milestone',
  status ENUM('planning', 'active', 'on_hold', 'completed') DEFAULT 'planning',
  account_manager_id INT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (account_manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Which team members work on which project
CREATE TABLE project_team (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment (project_id, user_id)
);

-- Milestones for milestone/hybrid mode projects
CREATE TABLE project_milestones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  sequence_order INT NOT NULL,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Activity log: meetings, calls, emails, updates, documents, notes
CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  author_id INT NOT NULL,
  type ENUM('meeting', 'call', 'email', 'update', 'document', 'task', 'note', 'feedback') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  visibility ENUM('internal', 'client_visible') NOT NULL DEFAULT 'internal',
  reference_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_project_visibility (project_id, visibility)
);