import { supabase } from '~/supabase'
import type { StickyNote, StickyNoteReaction, StickyNoteWithReactions } from '~/types/stickynote'
import { useCreateStickyNote } from '~/features/InteractiveStickyNotes/useCreateStickyNote'
import { useDeleteStickyNote } from './useDeleteStickyNote'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  EVENT_STICKY_NOTES_CONTENT_UPDATED,
  EVENT_STICKY_NOTES_CREATED,
  EVENT_STICKY_NOTES_DELETED,
  EVENT_STICKY_NOTES_REACTION_ADDED
} from '~/types/events'
import { useBroadcastChannel } from '~/hooks/useBroadcastChannel'
import { useMemo } from 'react'
import type { AvatarConfig } from 'react-nice-avatar'
import type { Position } from '~/types/general'

const getStickyNotes = async () => {
  const { data, error } = await supabase
    .from('sticky_notes')
    .select('*, user:users(*), sticky_notes_reactions:sticky_notes_reactions(*)')
  if (error) {
    throw error
  }
  return data.map((stickyNote) => ({
    ...stickyNote,
    user: {
      ...stickyNote.user,
      position: stickyNote.user.position as Position,
      avatarConfig: stickyNote.user.avatarConfig as AvatarConfig
    }
  }))
}

export const useStickyNotes = () => {
  const queryClient = useQueryClient()
  const handlers = useMemo(
    () => [
      {
        event: EVENT_STICKY_NOTES_CREATED,
        callback: (payload: { payload: StickyNote }) => {
          queryClient.setQueryData(['sticky_notes'], (current: StickyNote[]) => [...current, payload.payload])
        }
      },
      {
        event: EVENT_STICKY_NOTES_DELETED,
        callback: (payload: { payload: string }) => {
          queryClient.setQueryData(['sticky_notes'], (current: StickyNote[]) =>
            current.filter((stickyNote) => stickyNote.id !== payload.payload)
          )
        }
      },
      {
        event: EVENT_STICKY_NOTES_CONTENT_UPDATED,
        callback: (payload: { payload: StickyNote }) => {
          queryClient.setQueryData(['sticky_notes'], (current: StickyNote[]) =>
            current.map((stickyNote) => (stickyNote.id === payload.payload.id ? payload.payload : stickyNote))
          )
        }
      },
      {
        event: EVENT_STICKY_NOTES_REACTION_ADDED,
        callback: (payload: { payload: StickyNoteReaction }) => {
          queryClient.setQueryData(['sticky_notes'], (current: StickyNoteWithReactions[]) =>
            current.map((stickyNote) =>
              stickyNote.id === payload.payload.sticky_note_id
                ? {
                    ...stickyNote,
                    sticky_notes_reactions: [
                      ...(stickyNote.sticky_notes_reactions.filter((reaction) => reaction.id !== payload.payload.id) ??
                        []),
                      payload.payload
                    ]
                  }
                : stickyNote
            )
          )
        }
      }
    ],
    [queryClient]
  )
  const { channel, isConnected } = useBroadcastChannel('sticky-notes', handlers)
  const { data: stickyNotes } = useQuery({
    queryFn: getStickyNotes,
    queryKey: ['sticky_notes']
  })
  const { mutate: createStickyNote } = useCreateStickyNote(channel)
  const { mutate: deleteStickyNote } = useDeleteStickyNote(channel)

  return { stickyNotes, isConnected, createStickyNote, deleteStickyNote }
}
