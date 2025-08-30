import { useEffect, useState } from 'react'
import { supabase } from '~/supabase'
import type { StickyNote } from '~/types/stickynote'
import { useCreateStickyNote } from '~/features/InteractiveStickyNotes/useCreateStickyNote'
import { useDeleteStickyNote } from './useDeleteStickyNote'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { EVENT_STICKY_NOTES_CREATED, EVENT_STICKY_NOTES_DELETED } from './stickyNotesEvents'

const getStickyNotes = async () => {
  const { data, error } = await supabase.from('sticky_notes').select('*')
  if (error) {
    throw error
  }
  return data
}

export const useStickyNotes = () => {
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()
  const { data: stickyNotes } = useQuery<StickyNote[]>({
    queryFn: getStickyNotes,
    queryKey: ['sticky_notes']
  })
  const { mutate: createStickyNote } = useCreateStickyNote(channel)
  const { mutate: deleteStickyNote } = useDeleteStickyNote(channel)

  useEffect(() => {
    const newChannel = supabase.channel('sticky-notes')
    newChannel
      .on('broadcast', { event: EVENT_STICKY_NOTES_CREATED }, (payload) => {
        queryClient.setQueryData(['sticky_notes'], (current: StickyNote[]) => [
          ...current,
          payload.payload as StickyNote
        ])
      })
      .on('broadcast', { event: EVENT_STICKY_NOTES_DELETED }, (payload) => {
        queryClient.setQueryData(['sticky_notes'], (current: StickyNote[]) =>
          current.filter((stickyNote) => stickyNote.id !== (payload.payload as string))
        )
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    setChannel(newChannel)

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [queryClient])

  return { stickyNotes, isConnected, createStickyNote, deleteStickyNote }
}
