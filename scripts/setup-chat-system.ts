import { sql } from "@/lib/db"

export async function setupChatSystem() {
  try {
    // Create chat_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY,
        user_id UUID,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        topic TEXT,
        agent_id TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE,
        active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `

    // Create chat_messages table
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY,
        session_id UUID NOT NULL,
        sender TEXT NOT NULL CHECK (sender IN ('user', 'agent')),
        message TEXT NOT NULL,
        user_email TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_email ON chat_sessions(user_email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(active)`

    return { success: true, message: "Chat system tables created successfully" }
  } catch (error) {
    console.error("Error setting up chat system:", error)
    return { success: false, message: "Failed to set up chat system", error }
  }
}
