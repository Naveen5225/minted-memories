# MySQL Connection String - Password Encoding Guide

## Issue: Special Characters in Password

If your MySQL password contains special characters, they must be URL-encoded in the connection string.

## Common Special Characters and Their Encodings

| Character | URL Encoding |
|-----------|--------------|
| `#`       | `%23`        |
| `@`       | `%40`        |
| `%`       | `%25`        |
| `&`       | `%26`        |
| `+`       | `%2B`        |
| `=`       | `%3D`        |
| `?`       | `%3F`        |
| `/`       | `%2F`        |
| `:`       | `%3A`        |
| ` ` (space)| `%20` or `+` |

## Examples

### Password: `test#123`
```env
DATABASE_URL="mysql://root:test%23123@localhost:3306/mintedmemories"
```

### Password: `my@pass#word`
```env
DATABASE_URL="mysql://root:my%40pass%23word@localhost:3306/mintedmemories"
```

### Password: `pass%word`
```env
DATABASE_URL="mysql://root:pass%25word@localhost:3306/mintedmemories"
```

## Quick Fix for Your Password

Your password is `test#123`, so:
- `#` becomes `%23`
- Final: `test%23123`

## Alternative: Use Environment Variable

You can also use Prisma's connection string format with environment variables:

```env
DATABASE_URL="mysql://root:${MYSQL_PASSWORD}@localhost:3306/mintedmemories"
MYSQL_PASSWORD="test#123"
```

But URL encoding is simpler and more reliable.

## Test Your Connection String

After updating, test with:
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```
