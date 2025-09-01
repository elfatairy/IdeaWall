import type { Database } from './supabase'

export type StickyNote = Database['public']['Tables']['sticky_notes']['Row']
export type StickyNoteReaction = Database['public']['Tables']['sticky_notes_reactions']['Row']
export type StickyNoteWithReactions = StickyNote & { sticky_notes_reactions: StickyNoteReaction[] }
