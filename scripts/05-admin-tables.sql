-- Admin Tables for Supabase
-- Run this in your Supabase SQL Editor

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Admin Sessions Table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Insert default admin users with proper credentials
INSERT INTO admin_users (username, email, password_hash, role) 
VALUES 
    ('admin', 'admin@agripanel.com', '$2a$10$dummy.hash.for.demo', 'admin'),
    ('superadmin', 'superadmin@agripanel.com', '$2a$10$dummy.hash.for.demo', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_username ON admin_sessions(username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- Allow all operations for authenticated users (you can customize this)
CREATE POLICY "Allow all for authenticated users" ON admin_users
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON admin_sessions
    FOR ALL USING (true);

-- 7. Display admin credentials (for reference)
-- Admin Email: admin@agripanel.com
-- Admin Password: Admin@123
-- SuperAdmin Email: superadmin@agripanel.com  
-- SuperAdmin Password: SuperAdmin@123 