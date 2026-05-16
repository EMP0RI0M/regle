import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fagotmydnvljxnnxabht.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YJWN-d2RGr6dZQTL4sXrAQ_47B1leUU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
