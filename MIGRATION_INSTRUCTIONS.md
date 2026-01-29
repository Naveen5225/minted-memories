# Migration Instructions - Fix Order Type Bug

## ⚠️ CRITICAL: Run These Steps

### Step 1: Run Prisma Migration
This adds the `orderType` column to the `order_items` table:

```bash
cd backend
npx prisma migrate dev --name add_order_type_to_order_items
```

**Expected output:**
- Creates a new migration file
- Applies the migration to your database
- Adds `order_type` column to `order_items` table

### Step 2: Regenerate Prisma Client
This updates the Prisma client to recognize the new `orderType` field:

```bash
cd backend
npx prisma generate
```

**Expected output:**
- Prisma Client regenerated successfully

### Step 3: Restart Backend Server
Stop your current backend server (Ctrl+C) and restart it:

```bash
cd backend
npm run dev
# OR
npm start
```

### Step 4: Verify the Fix
1. Create a test order with:
   - 1 MAGNET item
   - 1 POLAROID item
2. Check the Orders page - should show:
   - Magnets: 1
   - Polaroids: 1
3. Check Admin Orders page - should show:
   - Magnets: 1
   - Polaroids: 1

---

## If Migration Fails

If you get an error about the column already existing, you can manually add it:

```sql
ALTER TABLE order_items ADD COLUMN order_type VARCHAR(20) DEFAULT 'MAGNET';
CREATE INDEX order_items_order_type_idx ON order_items(order_type);
```

Then regenerate Prisma client:
```bash
npx prisma generate
```

---

## What Changed

1. **Schema**: Added `orderType` field to `OrderItem` model
2. **Backend**: Order creation now saves `orderType` per item
3. **Backend**: Count calculation filters by `item.orderType`
4. **Frontend**: Displays counts correctly for mixed orders
