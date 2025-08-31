import { Fragment } from 'react/jsx-runtime'
import { StickyNote } from '~/components/StickyNote'
import type { Position } from '~/types/general'
import type { StickyNote as StickyNoteType } from '~/types/stickynote'
import { AnimatePresence } from 'motion/react'
import { createContext, useContext } from 'react'
import type { supabase } from '~/supabase'
import type { User } from '~/contexts/ProfileContext'

interface Props {
  stickyNotes: (StickyNoteType & { user: User })[]
  onDeleteStickyNote: (id: string) => void
  render: (position: { x: number, y: number }, StickyNote: () => React.ReactNode) => React.ReactNode
}

export function StickyNotes({ stickyNotes, onDeleteStickyNote, render }: Props) {
  return (
    <AnimatePresence>
      {stickyNotes.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).filter(stickyNote => stickyNote.position !== null).map((stickyNote) => (
        <Fragment key={stickyNote.id}>
          {render(stickyNote.position as Position, () => (
            <StickyNote
              {...stickyNote}
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
  return useContext(ChannelContext)
}