import { supabase } from '~/supabase'
import type { StickyNote } from '~/types/stickynote'
import { useCreateStickyNote } from '~/features/InteractiveStickyNotes/useCreateStickyNote'
import { useDeleteStickyNote } from './useDeleteStickyNote'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { EVENT_STICKY_NOTES_CREATED, EVENT_STICKY_NOTES_DELETED } from './stickyNotesEvents'
import { useBroadcastChannel } from '~/hooks/useRealtime'
import { useMemo } from 'react'

const getStickyNotes = async () => {
  const { data, error } = await supabase.from('sticky_notes').select('*')
  if (error) {
    throw error
  }
  return data
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
      }
    ],
    [queryClient]
  )
  const { channel, isConnected } = useBroadcastChannel('sticky-notes', handlers)
  const { data: stickyNotes } = useQuery<StickyNote[]>({
    queryFn: getStickyNotes,
    queryKey: ['sticky_notes']
  })
  const { mutate: createStickyNote } = useCreateStickyNote(channel)
  const { mutate: deleteStickyNote } = useDeleteStickyNote(channel)

  return { stickyNotes, isConnected, createStickyNote, deleteStickyNote }
}
