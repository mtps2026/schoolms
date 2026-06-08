-- Migration: Add admission_no to students_data
-- Date: 02-06-2026

ALTER TABLE students_data
    ADD COLUMN IF NOT EXISTS admission_no TEXT;
