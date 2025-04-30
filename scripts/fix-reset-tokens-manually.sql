-- Drop existing tables if they exist
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS simple_reset_tokens CASCADE;

-- Create a simple reset tokens table without foreign keys
CREATE TABLE simple_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_simple_reset_tokens_token ON simple_reset_tokens(token);
CREATE INDEX idx_simple_reset_tokens_user_id ON simple_reset_tokens(user_id);

-- Create the original table as well for compatibility
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for the original table
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
