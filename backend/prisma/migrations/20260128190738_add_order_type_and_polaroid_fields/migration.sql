-- AlterTable
ALTER TABLE `order_items` ADD COLUMN `caption` VARCHAR(255) NULL,
    ADD COLUMN `polaroid_type` VARCHAR(50) NULL;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `order_type` VARCHAR(20) NOT NULL DEFAULT 'MAGNET';

-- CreateTable
CREATE TABLE `event_bookings` (
    `id` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(50) NOT NULL,
    `event_date` DATETIME(3) NOT NULL,
    `time_slot` VARCHAR(50) NOT NULL,
    `location` VARCHAR(500) NOT NULL,
    `expected_guests` INTEGER NOT NULL,
    `contact_name` VARCHAR(255) NOT NULL,
    `contact_phone` VARCHAR(20) NOT NULL,
    `notes` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'NEW',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
