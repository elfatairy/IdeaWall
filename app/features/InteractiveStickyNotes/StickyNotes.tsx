import { Fragment } from 'react/jsx-runtime'
import { StickyNote } from '~/components/StickyNote'
import { useProfile } from '~/contexts/ProfileContext'
import type { Position } from '~/types/general'
import type { StickyNote as StickyNoteType } from '~/types/stickynote'

interface Props {
  stickyNotes: StickyNoteType[]
  render: (position: { x: number, y: number }, StickyNote: () => React.ReactNode) => React.ReactNode
}

export function StickyNotes({ stickyNotes, render }: Props) {
  const { profile } = useProfile()
  return (
    <div>
      {stickyNotes.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).filter(stickyNote => stickyNote.position !== null).map((stickyNote) => (
        <Fragment key={stickyNote.id}>
          {render(stickyNote.position as Position, () => (
            <StickyNote color={stickyNote.color} content={stickyNote.content} owner={stickyNote.user_id === profile?.id} />
          ))}
        </Fragment>
      ))}
    </div>
  )
}