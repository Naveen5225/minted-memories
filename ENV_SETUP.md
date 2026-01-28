# Environment Variables Setup Guide

## Fixing MySQL Authentication Error

The error "Authentication failed" means your MySQL credentials in `.env` are incorrect.

## Step 1: Test MySQL Connection

Try connecting to MySQL:

```bash
mysql -u root -p
```

If this works, note your password. If it doesn't work, see options below.

## Step 2: Update .env File

Edit `/Users/naveen/Documents/GitHub/FM/backend/.env` and update:

### Option A: If MySQL root has a password
```env
DATABASE_URL="mysql://root:YOUR_ACTUAL_PASSWORD@localhost:3306/mintedmemories"
```

### Option B: If MySQL root has NO password
```env
DATABASE_URL="mysql://root@localhost:3306/mintedmemories"
```

### Option C: Create a new MySQL user (Recommended)
```sql
-- Connect to MySQL
mysql -u root -p

-- Create user and database
CREATE DATABASE mintedmemories;
CREATE USER 'minteduser'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON mintedmemories.* TO 'minteduser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Then in `.env`:
```env
DATABASE_URL="mysql://minteduser:your_secure_password@localhost:3306/mintedmemories"
```

## Step 3: Verify MySQL is Running

```bash
# macOS
brew services list | grep mysql

# Or check if MySQL is running
ps aux | grep mysql
```

If MySQL is not running:
```bash
# macOS
brew services start mysql

# Ubuntu
sudo systemctl start mysql
```

## Step 4: Test Connection

After updating `.env`, test the connection:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## Common Issues

### Issue: "Access denied for user 'root'@'localhost'"
**Solution**: 
1. Reset MySQL root password
2. Or create a new user (Option C above)

### Issue: "Can't connect to MySQL server"
**Solution**: 
1. Start MySQL service
2. Check if MySQL is running on port 3306

### Issue: "Unknown database 'mintedmemories'"
**Solution**: 
```sql
CREATE DATABASE mintedmemories;
```

## Quick Fix Commands

```bash
# 1. Test MySQL connection
mysql -u root -p

# 2. If connection works, create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mintedmemories;"

# 3. Update .env with correct password
# Edit backend/.env file manually

# 4. Test Prisma connection
cd backend
npm run prisma:generate
```
