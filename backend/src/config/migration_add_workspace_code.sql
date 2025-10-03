-- Migration to add workspace_code to existing workspaces table
-- Run this if you have an existing database without workspace_code

-- Add workspace_code column if it doesn't exist
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS workspace_code VARCHAR(10) UNIQUE;

-- Add index for workspace_code if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_workspace_code ON workspaces(workspace_code);

-- Generate workspace codes for existing workspaces that don't have them
UPDATE workspaces 
SET workspace_code = CONCAT(
  CHAR(65 + FLOOR(RAND() * 26)),
  CHAR(65 + FLOOR(RAND() * 26)),
  CHAR(65 + FLOOR(RAND() * 26)),
  CHAR(65 + FLOOR(RAND() * 26)),
  CHAR(48 + FLOOR(RAND() * 10)),
  CHAR(48 + FLOOR(RAND() * 10))
)
WHERE workspace_code IS NULL OR workspace_code = '';

-- Ensure all workspace codes are unique by adding a suffix if needed
SET @counter = 1;
UPDATE workspaces w1
JOIN (
  SELECT id, workspace_code, 
         ROW_NUMBER() OVER (PARTITION BY workspace_code ORDER BY id) as rn
  FROM workspaces
) w2 ON w1.id = w2.id
SET w1.workspace_code = CONCAT(w1.workspace_code, w2.rn)
WHERE w2.rn > 1;