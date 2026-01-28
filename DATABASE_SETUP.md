# Database Setup Guide

## MySQL Installation

### macOS
```bash
brew install mysql
brew services start mysql
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
```

### Windows
Download and install from: https://dev.mysql.com/downloads/mysql/

## Create Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE mintedmemories;

# Create a user (optional, recommended for production)
CREATE USER 'minteduser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON mintedmemories.* TO 'minteduser'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

## Database Connection String Format

```
mysql://username:password@localhost:3306/mintedmemories
```

Replace:
- `username` - Your MySQL username (default: `root`)
- `password` - Your MySQL password
- `mintedmemories` - Database name
- `3306` - Default MySQL port (change if using different port)

## Running Migrations

After setting up the database and configuring `DATABASE_URL` in `.env`:

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# This will:
# 1. Create migration files
# 2. Apply migrations to database
# 3. Generate Prisma Client
```

## Prisma Studio

View and edit your database through a GUI:

```bash
cd backend
npm run prisma:studio
```

This opens Prisma Studio at http://localhost:5555

## Troubleshooting

### Connection Error
- Check if MySQL is running:
  - macOS: `brew services list`
  - Ubuntu: `sudo systemctl status mysql`
  - Windows: Check Services panel
- Verify username and password
- Check if database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Migration Errors
- Ensure database is empty or use `--force` flag (careful: deletes data)
- Check `DATABASE_URL` in `.env` file
- Verify Prisma schema syntax
- Ensure MySQL version is 5.7+ (for JSON support)

### Permission Errors
- Ensure MySQL user has CREATE DATABASE permission
- Check MySQL user privileges: `SHOW GRANTS FOR 'username'@'localhost';`
- Verify MySQL authentication settings

### JSON Support
- MySQL 5.7+ supports JSON data type
- If using older MySQL, consider upgrading or using MariaDB 10.2+

## MySQL Requirements

- **Minimum Version**: MySQL 5.7 or MariaDB 10.2+
- **Required Features**: JSON data type support
- **Recommended**: MySQL 8.0+ for better performance
