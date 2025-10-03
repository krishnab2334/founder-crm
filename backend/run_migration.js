const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'founder_crm',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
});

// Read and execute migration
const migrationPath = path.join(__dirname, 'src/config/migration_add_beautified_messages.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

connection.query(migrationSQL, (error, results) => {
  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  
  console.log('✅ Migration completed successfully');
  console.log('Created beautified_status_messages table');
  connection.end();
});