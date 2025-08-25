import Grid from 'features/Grid/Grid'
import type { Route } from './+types/whiteboard'
import { GRID_CELL_SIZE, GRID_HEIGHT, GRID_WIDTH, MAX_ZOOM, MIN_ZOOM } from 'constants/grid'
import Avatar, { genConfig } from 'react-nice-avatar'
import { Button } from '~/components/ui/button'

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
  return (
    <>
      <header className='fixed z-10 flex w-full items-center justify-between px-4 py-2'>
        <img src="/logo.svg" alt="IdeaWall" className='h-10' />

        <HeaderActions />
      </header>
      <div className='fixed h-screen w-screen'>
        <Grid width={GRID_WIDTH} height={GRID_HEIGHT} gridSize={GRID_CELL_SIZE} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
      </div>
    </>
  )
}

function HeaderActions() {

  const renderOnlineUsers = () => {
    return (
      <div className='flex flex-row'>
        {
          activeUsers.slice(0, 4).map((user, index) => {
            return (
              <div className='relative w-6 z-10' key={user.id}>
                <div className='bg-white rounded-full p-1 w-10 h-10'>
                  <Avatar key={index} className='w-full h-full' {...user.config} />
                  {/* <div className='bg-white p-1/2 w-3 h-3 rounded-full absolute top-2 left-0 flex items-center justify-center'>
                        <span className='bg-green-600 rounded-full w-2 h-2' />
                      </div> */}
                </div>
              </div>
            )
          })
        }
        {
          activeUsers.length > 4 && (
            <div className='z-10'>
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
  return (
    <div className='flex flex-row gap-2 bg-white rounded-lg py-1 pl-2 pr-3 mt-1 shadow-lg items-center'>
      {renderOnlineUsers()}
      {/* <img src="/assets/icons/share.svg" alt="Share" className='h-4 fill-gray-500' /> */}
      <Button size='sm'>
        Share board
      </Button>
    </div>
  )
}