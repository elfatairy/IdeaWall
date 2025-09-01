import type { Route } from './+types/whiteboard'
import { type GridRef } from '~/features/Grid/Grid'
import { useRef } from 'react'
import { useProfile } from '~/contexts/ProfileContext'
import { CreateProfileDialog } from '~/features/CreateProfile/CreateProfile'
import { useSendHeartbeat } from '~/hooks/useNotifyOnline'
import { Header } from '~/features/Whiteboard/Header'
import { MainGrid } from '~/features/Whiteboard/MainGrid'

export function meta({ }: Route.MetaArgs) {
  return [
    { title: 'IdeaWall' },
    {
      name: 'description',
      content:
        'Collaborate in real-time on a shared online whiteboard. Create, edit, and react to sticky notes with friends or colleagues. Start brainstorming now—no login required!'
    }
  ]
}

export default function Whiteboard() {
  useSendHeartbeat()
  const { profile } = useProfile()
  const gridRef = useRef<GridRef>(null)

  const handleSkipToWhiteboard = () => {
    gridRef.current?.focusGrid()
  }

  return (
    <>
      <Header handleSkipToWhiteboard={handleSkipToWhiteboard} />

      <MainGrid gridRef={gridRef} />

      <CreateProfileDialog open={!profile} />
    </>
  )
}