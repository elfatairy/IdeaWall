import { useCallback, useEffect, useState } from 'react'
import { supabase } from '~/supabase'
import type { StickyNote } from '~/types/stickynote'
import { useApi } from '~/hooks/useApi'
import { useCreateStickyNote } from '~/features/InteractiveStickyNotes/useCreateStickyNote'
import type { Position } from '~/types/general'
import { useProfile } from '~/contexts/ProfileContext'
import { useDeleteStickyNote } from './useDeleteStickyNote'

const EVENT_STICKY_NOTES_CREATED = 'sticky_notes_created'
const EVENT_STICKY_NOTES_DELETED = 'sticky_notes_deleted'

export const useStickyNotes = () => {
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const { profile } = useProfile()
  const [isConnected, setIsConnected] = useState(false)
  const { call: _createStickyNote } = useCreateStickyNote()
  const { call: _deleteStickyNote } = useDeleteStickyNote()
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
        setStickyNotes((current) => [...current, payload.payload as StickyNote])
      })
      .on('broadcast', { event: EVENT_STICKY_NOTES_DELETED }, (payload) => {
        setStickyNotes((current) => current.filter((stickyNote) => stickyNote.id !== (payload.payload as string)))
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
      const tempStickyNote = {
        ...stickyNote,
        created_at: new Date().toISOString(),
        id: crypto.randomUUID(),
        updated_at: new Date().toISOString(),
        user_id: profile!.id
      }
      setStickyNotes((current) => [...current, tempStickyNote])
      const result = await _createStickyNote({
        id: tempStickyNote.id,
        content: stickyNote.content,
        color: stickyNote.color,
        position: stickyNote.position as Position
      })
      if (result.success) {
        channel?.send({
          type: 'broadcast',
          event: EVENT_STICKY_NOTES_CREATED,
          payload: result.data
        })
      } else {
        setStickyNotes((current) => current.filter((stickyNote) => stickyNote.id !== tempStickyNote.id))
      }
      return result
    },
    [_createStickyNote, profile, channel]
  )

  const deleteStickyNote = useCallback(
    async (id: string) => {
      setStickyNotes((current) => current.filter((stickyNote) => stickyNote.id !== id))
      const result = await _deleteStickyNote(id)
      if (result.success) {
        channel?.send({
          type: 'broadcast',
          event: EVENT_STICKY_NOTES_DELETED,
          payload: id
        })
      }
      return result
    },
    [_deleteStickyNote, channel]
  )

  return { stickyNotes, isConnected, createStickyNote, deleteStickyNote }
}
