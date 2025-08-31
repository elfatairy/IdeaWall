import { Fragment } from 'react/jsx-runtime'
import { StickyNote } from '~/components/StickyNote'
import { useProfile } from '~/contexts/ProfileContext'
import type { Position } from '~/types/general'
import type { StickyNote as StickyNoteType } from '~/types/stickynote'
import { AnimatePresence } from 'motion/react'
import { createContext, useContext } from 'react'
import type { supabase } from '~/supabase'

interface Props {
  stickyNotes: StickyNoteType[]
  onDeleteStickyNote: (id: string) => void
  render: (position: { x: number, y: number }, StickyNote: () => React.ReactNode) => React.ReactNode
}

export function StickyNotes({ stickyNotes, onDeleteStickyNote, render }: Props) {
  const { profile } = useProfile()
  return (
    <AnimatePresence>
      {stickyNotes.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).filter(stickyNote => stickyNote.position !== null).map((stickyNote) => (
        <Fragment key={stickyNote.id}>
          {render(stickyNote.position as Position, () => (
            <StickyNote
              id={stickyNote.id}
              color={stickyNote.color}
              content={stickyNote.content}
              owner={stickyNote.user_id === profile?.id}
              onDelete={() => {
                onDeleteStickyNote(stickyNote.id)
              }}
            />
          ))}
        </Fragment>
      ))}
    </AnimatePresence>
  )
}

const ChannelContext = createContext<ReturnType<typeof supabase.channel> | null>(null)

export function StickyNotesWithChannel({ stickyNotes, onDeleteStickyNote, render, channel }: Props & { channel: ReturnType<typeof supabase.channel> | null }) {
  return (
    <ChannelContext.Provider value={channel}>
      <StickyNotes stickyNotes={stickyNotes} onDeleteStickyNote={onDeleteStickyNote} render={render} />
    </ChannelContext.Provider>
  )
}

export function useChannel() {
  const channel = useContext(ChannelContext)
  if (!channel) {
    throw new Error('Channel not found')
  }
  return useContext(ChannelContext)
}