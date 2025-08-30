import { useCallback, useEffect, useState } from 'react'
import { supabase } from '~/supabase'
import type { StickyNote } from '~/types/stickynote'
import { useApi } from '~/hooks/useApi'
import { useCreateStickyNote } from '~/hooks/useCreateStickyNote'
import type { Position } from '~/types/general'
import { useProfile } from '~/contexts/ProfileContext'

const EVENT_STICKY_NOTES_CREATED = 'sticky_notes_created'

export const useStickyNotes = () => {
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const { profile } = useProfile()
  const [isConnected, setIsConnected] = useState(false)
  const { call: _createStickyNote } = useCreateStickyNote()
  const { call: fetchStickyNotes } = useApi({
    apiFunction: async () => {
      const { data, error } = await supabase.from('sticky_notes').select('*')
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: (data) => {
      setStickyNotes(data)
    }
  })

  useEffect(() => {
    fetchStickyNotes(undefined)
  }, [fetchStickyNotes])

  useEffect(() => {
    const newChannel = supabase.channel('sticky-notes')
    newChannel
      .on('broadcast', { event: EVENT_STICKY_NOTES_CREATED }, (payload) => {
        console.log('payload', payload)
        setStickyNotes((current) => [...current, payload.payload as StickyNote])
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
  }, [])

  const createStickyNote = useCallback(
    async (stickyNote: Pick<StickyNote, 'content' | 'color' | 'position'>) => {
      setStickyNotes((current) => [
        ...current,
        {
          ...stickyNote,
          created_at: new Date().toISOString(),
          id: crypto.randomUUID(),
          updated_at: new Date().toISOString(),
          user_id: profile!.id
        }
      ])
      const result = await _createStickyNote({
        content: stickyNote.content,
        color: stickyNote.color,
        position: stickyNote.position as Position
      })
      if (result.success) {
        channel?.send({
          type: 'broadcast',
          event: EVENT_STICKY_NOTES_CREATED,
          payload: stickyNote
        })
      }
      return result
    },
    [channel, _createStickyNote]
  )

  return { stickyNotes, isConnected, createStickyNote }
}
