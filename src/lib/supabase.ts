import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qebniuerwopbgyuwdkzh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlYm5pdWVyd29wYmd5dXdka3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjkwNjksImV4cCI6MjA3OTMwNTA2OX0.xC8Clwl-aAGMNSPXrG2nJzs0LVmRBc8tVSCt-Nr4l0Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Для серверных операций используем service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)