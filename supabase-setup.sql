-- BaseTask Supabase Database Setup
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);

-- 2. Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_wallet TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward NUMERIC NOT NULL,
  proof_type TEXT NOT NULL,
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);

-- 3. Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  worker_wallet TEXT NOT NULL,
  proof TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_submissions_task ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_worker ON submissions(worker_wallet);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- 4. Enable Row Level Security (Optional - for production)
-- Uncomment these if you want to add security policies

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Example RLS Policies (customize as needed):

-- Allow anyone to read users
-- CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);

-- Allow users to insert their own data
-- CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (true);

-- Allow anyone to read active tasks
-- CREATE POLICY "Active tasks are viewable by everyone" ON tasks FOR SELECT USING (status = 'active' OR true);

-- Allow authenticated users to create tasks
-- CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (true);

-- Allow task creators to update their tasks
-- CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (true);

-- Allow anyone to read submissions
-- CREATE POLICY "Submissions viewable by task creator and worker" ON submissions FOR SELECT USING (true);

-- Allow users to create submissions
-- CREATE POLICY "Users can create submissions" ON submissions FOR INSERT WITH CHECK (true);

-- Allow task creators to update submissions (approve/reject)
-- CREATE POLICY "Task creators can update submissions" ON submissions FOR UPDATE USING (true);

-- 5. Sample data for testing (Optional)
-- Uncomment to insert test data

-- INSERT INTO users (wallet_address) VALUES 
--   ('0x1234567890123456789012345678901234567890'),
--   ('0x0987654321098765432109876543210987654321');

-- INSERT INTO tasks (creator_wallet, title, description, reward, proof_type, deadline, status) VALUES
--   ('0x1234567890123456789012345678901234567890', 'Design a logo', 'Create a modern logo for my startup', 50, 'image', '2025-12-31', 'active'),
--   ('0x1234567890123456789012345678901234567890', 'Write blog post', 'Write a 1000-word article about Web3', 25, 'link', '2025-12-15', 'active');

-- 6. Verify tables created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'tasks', 'submissions');

-- Add platform fee tracking columns to submissions table
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS platform_fee_tx TEXT,
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC,
ADD COLUMN IF NOT EXISTS worker_payment NUMERIC;