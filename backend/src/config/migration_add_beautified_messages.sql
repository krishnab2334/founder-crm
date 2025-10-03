-- Migration to add beautified status messages table
USE founder_crm;

-- Beautified Status Messages Table (for founder dashboard)
CREATE TABLE IF NOT EXISTS beautified_status_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT NOT NULL,
  user_id INT NOT NULL,
  task_id INT NOT NULL,
  original_status VARCHAR(50) NOT NULL,
  new_status VARCHAR(50) NOT NULL,
  beautified_message TEXT NOT NULL,
  summary VARCHAR(255),
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  category ENUM('sales', 'product', 'operations', 'fundraising', 'other') DEFAULT 'other',
  action_type VARCHAR(50) DEFAULT 'status_update',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  INDEX idx_workspace (workspace_id),
  INDEX idx_user (user_id),
  INDEX idx_task (task_id),
  INDEX idx_created_at (created_at)
);