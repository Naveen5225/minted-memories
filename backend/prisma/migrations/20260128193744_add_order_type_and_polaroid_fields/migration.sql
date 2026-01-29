-- AlterTable
ALTER TABLE `order_items` ADD COLUMN `order_type` VARCHAR(20) NOT NULL DEFAULT 'MAGNET';

-- CreateIndex
CREATE INDEX `order_items_order_type_idx` ON `order_items`(`order_type`);
