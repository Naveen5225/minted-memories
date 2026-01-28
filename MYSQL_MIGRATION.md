# MySQL Migration Guide

## What Changed

The database has been migrated from PostgreSQL to MySQL. Here's what you need to do:

## Steps to Migrate

### 1. Install MySQL

If you don't have MySQL installed:
- **macOS**: `brew install mysql && brew services start mysql`
- **Ubuntu**: `sudo apt-get install mysql-server && sudo systemctl start mysql`
- **Windows**: Download from https://dev.mysql.com/downloads/mysql/

### 2. Create MySQL Database

```bash
mysql -u root -p
CREATE DATABASE mintedmemories;
EXIT;
```

### 3. Update Environment Variables

Update `backend/.env`:

```env
# Change from PostgreSQL to MySQL
DATABASE_URL="mysql://username:password@localhost:3306/mintedmemories"
```

**Connection String Format:**
```
mysql://[username]:[password]@[host]:[port]/[database]
```

### 4. Regenerate Prisma Client

```bash
cd backend
npm run prisma:generate
```

### 5. Run Migrations

```bash
npm run prisma:migrate
```

This will:
- Create all tables in MySQL
- Set up relationships
- Create indexes

### 6. Important Notes

#### ID Generation
- Changed from `@default(uuid())` to `@default(cuid())`
- CUID is more MySQL-friendly and still provides unique IDs
- Existing UUIDs will need to be migrated if you have data

#### JSON Support
- MySQL 5.7+ supports JSON data type
- The `addressJson` field uses MySQL's native JSON type
- Ensure your MySQL version is 5.7 or higher

#### String Lengths
- Added explicit `@db.VarChar()` and `@db.Text` for better MySQL compatibility
- Photo URLs use `@db.Text` to handle long URLs

#### Indexes
- Added indexes on foreign keys for better performance
- `userId`, `orderId` are now indexed

### 7. Verify Migration

```bash
# Check tables
mysql -u root -p mintedmemories -e "SHOW TABLES;"

# Should show:
# - users
# - orders
# - order_items
# - payments
```

### 8. Test the Application

1. Start backend: `npm start`
2. Test API endpoints
3. Verify data is being stored correctly

## Troubleshooting

### "Unknown column type 'json'"
- **Solution**: Upgrade MySQL to 5.7+ or use MariaDB 10.2+

### Connection refused
- **Solution**: Ensure MySQL service is running
  - macOS: `brew services list`
  - Ubuntu: `sudo systemctl status mysql`

### Access denied
- **Solution**: Check MySQL user permissions
  ```sql
  GRANT ALL PRIVILEGES ON mintedmemories.* TO 'username'@'localhost';
  FLUSH PRIVILEGES;
  ```

## Differences from PostgreSQL

1. **ID Generation**: CUID instead of UUID
2. **JSON**: Native JSON type (MySQL 5.7+)
3. **String Types**: Explicit VARCHAR/TEXT definitions
4. **Port**: Default port is 3306 (not 5432)
5. **Connection String**: `mysql://` instead of `postgresql://`

## Production Considerations

- Use connection pooling for better performance
- Consider using MySQL 8.0+ for improved JSON performance
- Set up proper MySQL user with limited privileges
- Enable MySQL query logging for debugging
- Use SSL connections in production
