import Grid from 'features/Grid/Grid'
import type { Route } from './+types/whiteboard'

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
  return (
    <>
      <header className='fixed z-10 flex w-full items-center justify-between px-4 py-2'></header>
      <div className='fixed h-screen w-screen'>
        <Grid />
      </div>
    </>
  )
}
