-- Add beautified_status_message column to tasks table
-- This stores AI-enhanced status updates that are more readable for founders

USE founder_crm;

ALTER TABLE tasks ADD COLUMN beautified_status_message TEXT AFTER status;
ALTER TABLE tasks ADD COLUMN last_status_update TIMESTAMP NULL AFTER beautified_status_message;
