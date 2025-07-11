import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cwtzfdwxrtevkkwzoigc.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dHpmZHd4cnRldmtrd3pvaWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDY1NDQsImV4cCI6MjA2NzgyMjU0NH0.TRTUyvXHc2axxoj03DQoQiiF41-GQAht0H616TgTgM0"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
