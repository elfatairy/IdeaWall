import Grid from 'features/Grid/Grid'
import type { Route } from './+types/whiteboard'
import { GRID_CELL_SIZE, GRID_HEIGHT, GRID_WIDTH, MAX_ZOOM, MIN_ZOOM } from 'constants/grid'

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
        <Grid width={GRID_WIDTH} height={GRID_HEIGHT} gridSize={GRID_CELL_SIZE} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
      </div>
    </>
  )
}
