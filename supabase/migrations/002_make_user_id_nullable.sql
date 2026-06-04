-- 002_make_user_id_nullable.sql
-- Allow guest users to generate designs + orders without a Supabase Auth account

ALTER TABLE designs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
