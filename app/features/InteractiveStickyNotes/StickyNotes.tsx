import { Fragment } from 'react/jsx-runtime'
import { StickyNote } from '~/features/InteractiveStickyNotes/StickyNote'
import type { Position } from '~/types/general'
import type { StickyNote as StickyNoteType } from '~/types/stickynote'
import { AnimatePresence } from 'motion/react'
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