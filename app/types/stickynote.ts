import type { Database } from './supabase'

export type StickyNote = Database['public']['Tables']['sticky_notes']['Row']
