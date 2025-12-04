-- Script to fix duplicate ma_hoi_vien empty string issue
-- This script will:
-- 1. Drop the unique index temporarily
-- 2. Update all empty strings to NULL
-- 3. Recreate the unique index

-- Step 1: Drop the unique index
ALTER TABLE vo_sinh DROP INDEX IDX_624be563ef47696d519ff536f9;

-- Step 2: Update all empty strings to NULL
UPDATE vo_sinh SET ma_hoi_vien = NULL WHERE ma_hoi_vien = '' OR ma_hoi_vien IS NULL OR TRIM(ma_hoi_vien) = '';

-- Step 3: Recreate the unique index (only on non-NULL values)
-- Note: MySQL allows multiple NULL values in a unique column
ALTER TABLE vo_sinh ADD UNIQUE INDEX IDX_624be563ef47696d519ff536f9 (ma_hoi_vien);

-- Verify: Check for any remaining duplicate non-NULL values
-- SELECT ma_hoi_vien, COUNT(*) as count 
-- FROM vo_sinh 
-- WHERE ma_hoi_vien IS NOT NULL 
-- GROUP BY ma_hoi_vien 
-- HAVING COUNT(*) > 1;

