import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://cwtzfdwxrtevkkwzoigc.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dHpmZHd4cnRldmtrd3pvaWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI0NjU0NCwiZXhwIjoyMDY3ODIyNTQ0fQ.MxYnnIRkujwMY4twMt_Rz4bE8_ofHvUdnpm4Fib5bXk"

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
