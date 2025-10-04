# Database Migration Instructions

## AI Task Status Updates Feature

### Prerequisites
- MySQL database access
- Database name: `founder_crm`
- Database user with ALTER TABLE privileges

### Migration Overview
This migration adds two new columns to the `tasks` table:
1. `beautified_status_message` - Stores AI-enhanced status updates
2. `last_status_update` - Timestamp of the last status change

### Migration Steps

#### Option 1: Using MySQL Command Line

```bash
# Navigate to the backend config directory
cd backend/src/config

# Run the migration
mysql -u root -p founder_crm < add_beautified_status.sql

# Verify the migration
mysql -u root -p founder_crm -e "DESCRIBE tasks;"
```

#### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. Open the file `backend/src/config/add_beautified_status.sql`
4. Execute the SQL statements
5. Verify the new columns exist

#### Option 3: Manual SQL Execution

Connect to your database and run:

```sql
USE founder_crm;

ALTER TABLE tasks ADD COLUMN beautified_status_message TEXT AFTER status;
ALTER TABLE tasks ADD COLUMN last_status_update TIMESTAMP NULL AFTER beautified_status_message;
```

### Verification

After running the migration, verify the changes:

```sql
USE founder_crm;
DESCRIBE tasks;
```

You should see two new columns:
```
beautified_status_message | text     | YES  |     | NULL    |       |
last_status_update        | timestamp| YES  |     | NULL    |       |
```

### Test the Migration

1. **Check column exists:**
```sql
SELECT beautified_status_message, last_status_update 
FROM tasks 
LIMIT 1;
```

2. **Test insert:**
```sql
UPDATE tasks 
SET beautified_status_message = 'Test message', 
    last_status_update = NOW() 
WHERE id = 1;
```

3. **Verify update:**
```sql
SELECT id, title, status, beautified_status_message, last_status_update 
FROM tasks 
WHERE id = 1;
```

### Rollback (if needed)

If you need to rollback the migration:

```sql
USE founder_crm;

ALTER TABLE tasks DROP COLUMN beautified_status_message;
ALTER TABLE tasks DROP COLUMN last_status_update;
```

### Post-Migration

After successful migration:

1. ✅ Restart the backend server
2. ✅ Test task status updates via the UI
3. ✅ Verify AI beautification works
4. ✅ Check founder dashboard displays messages

### Troubleshooting

#### Error: "Duplicate column name"
**Cause:** Migration already run
**Solution:** Columns already exist, no action needed

#### Error: "Access denied"
**Cause:** Insufficient database privileges
**Solution:** Run with a user that has ALTER privileges:
```bash
mysql -u admin_user -p founder_crm < add_beautified_status.sql
```

#### Error: "Table 'tasks' doesn't exist"
**Cause:** Wrong database or table not created yet
**Solution:** Verify database name and run initial schema first

### Migration Checklist

Before migration:
- [ ] Database backup completed
- [ ] Backend server stopped (optional but recommended)
- [ ] Database credentials verified

During migration:
- [ ] Migration script executed successfully
- [ ] No errors in output
- [ ] Columns verified in table structure

After migration:
- [ ] Backend server restarted
- [ ] Test task update API endpoint
- [ ] Test AI beautification
- [ ] Test founder dashboard display
- [ ] Monitor logs for errors

### Production Deployment

For production environments:

1. **Create backup:**
```bash
mysqldump -u root -p founder_crm > backup_before_migration.sql
```

2. **Run migration during low-traffic period**

3. **Monitor application logs:**
```bash
tail -f backend/logs/error.log
```

4. **Test thoroughly:**
   - Update a test task
   - Verify beautified message appears
   - Check founder can view update

5. **Keep backup for 24-48 hours before deleting**

### Schema Changes Summary

| Column Name | Type | Null | Default | Key | Extra |
|-------------|------|------|---------|-----|-------|
| beautified_status_message | TEXT | YES | NULL | | |
| last_status_update | TIMESTAMP | YES | NULL | | |

### Impact Assessment

- **Downtime required:** No
- **Data loss risk:** None (only adding columns)
- **Existing data affected:** No
- **Application compatibility:** Backward compatible
- **Performance impact:** Minimal (indexed queries remain fast)

### Support

If you encounter issues:
1. Check MySQL error logs
2. Verify database user permissions
3. Ensure MySQL version compatibility (5.7+)
4. Review application logs for errors

---

**Migration Status:** Ready to execute
**Estimated Time:** < 1 minute
**Risk Level:** Low
