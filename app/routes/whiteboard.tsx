import Grid, { type GridRef } from '~/features/Grid/Grid'
import type { Route } from './+types/whiteboard'
import { GRID_CELL_SIZE, GRID_HEIGHT, GRID_WIDTH, MAX_ZOOM, MIN_ZOOM } from '~/constants/grid'
import Avatar, { genConfig } from 'react-nice-avatar'
import { Button } from '~/components/ui/button'
import { toast } from 'sonner'
import ShareIcon from '~/assets/icons/share.svg'
import { useId, useRef } from 'react'

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

const activeUsers = [
  {
    id: 1,
    name: 'John Doe',
    color: 'red',
    config: genConfig()
  },
  {
    id: 2,
    name: 'Jane Doe',
    color: 'blue',
    config: genConfig()
  },
  {
    id: 3,
    name: 'John Doe',
    color: 'red',
    config: genConfig()
  },
  {
    id: 4,
    name: 'Jane Doe',
    color: 'blue',
    config: genConfig()
  },
  {
    id: 5,
    name: 'John Doe',
    color: 'red',
    config: genConfig()
  },
  {
    id: 6,
    name: 'Jane Doe',
    color: 'blue',
    config: genConfig()
  },
  {
    id: 7,
    name: 'John Doe',
    color: 'red',
    config: genConfig()
  },
  {
    id: 8,
    name: 'Jane Doe',
    color: 'blue',
    config: genConfig()
  },
  {
    id: 9,
    name: 'John Doe',
    color: 'red',
    config: genConfig()
  },
]

export default function Whiteboard() {
  const gridRef = useRef<GridRef>(null)

  const handleSkipToWhiteboard = () => {
    gridRef.current?.focusGrid()
  }

  return (
    <>
      <button
        className='fixed top-0 left-0 z-1000 opacity-0 focus:opacity-10000 transition-opacity duration-300 bg-white p-2 underline'
        onClick={handleSkipToWhiteboard}
      >
        Skip to white board
      </button>
      <header className='fixed z-10 flex w-full items-center justify-between px-4 py-2'>
        <img src="/logo.svg" alt="IdeaWall" className='h-10' />

        <HeaderActions />
      </header>
      <div className='fixed h-dvh w-screen'>
        <Grid
          ref={gridRef}
          width={GRID_WIDTH}
          height={GRID_HEIGHT}
          gridSize={GRID_CELL_SIZE}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
        />
      </div>
    </>
  )
}

function HeaderActions() {

  const renderUser = (user: typeof activeUsers[number]) => {
    const labelId = useId();

    return (
      <div className='group w-6 z-100' key={user.id}>
        <div className='relative bg-white rounded-full p-1 w-10 h-10 focus:bg-gray-300 focus:outline-none' aria-describedby={labelId} tabIndex={0}>
          <Avatar className='w-full h-full' {...user.config} />
          <div id={labelId} className='absolute top-[100%] left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap bg-gray-200 rounded-full p-1 px-2 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300'>
            {user.name}
          </div>
        </div>
      </div>
    )
  }

  const renderOnlineUsers = () => {
    return (
      <div className='flex-row hidden sm:flex'>
        {
          activeUsers.slice(0, 4).map((user) => renderUser(user))
        }
        {
          activeUsers.length > 4 && (
            <div className='z-100'>
              <div className='bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center'>
                <div className='w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold'>
                  +{activeUsers.length - 4}
                </div>
              </div>
            </div>
          )
        }
      </div>
    )
  }
  const config = genConfig();

  return (
    <div className='flex flex-row gap-1 bg-white rounded-lg py-1 pl-2 pr-3 mt-1 shadow-lg items-center'>
      {renderOnlineUsers()}

      <Button size='icon' variant='ghost' aria-label='Share board link' onClick={() => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Board link copied, share it with your friends!')
      }} className='cursor-pointer'>
        <img src={ShareIcon} className='size-4' aria-hidden='true' />
      </Button>

      <button className='flex flex-row gap-2 ml-1' aria-label='Your avatar'>
        <div className="p-[2.5px] rounded-full bg-gradient-to-r from-emerald-600 to-green-400 cursor-pointer">
          <div className='bg-white rounded-full p-[2.5px] w-10 h-10'>
            <Avatar className='w-full h-full' {...config} />
          </div>
        </div>
      </button>
    </div>
  )
}
