import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_KEY as string

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
