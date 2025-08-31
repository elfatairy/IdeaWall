import Grid, { GridContent, GridItem, type GridRef } from '~/features/Grid/Grid'
import type { Route } from './+types/whiteboard'
import { GRID_CELL_SIZE, GRID_HEIGHT, GRID_WIDTH, MAX_ZOOM, MIN_ZOOM } from '~/constants/grid'
import Avatar from 'react-nice-avatar'
import { Button } from '~/components/ui/button'
import { toast } from 'sonner'
import ShareIcon from '~/assets/icons/share.svg'
import { useId, useRef, useState } from 'react'
import { useProfile, type User } from '~/contexts/ProfileContext'
import { cn } from '~/lib/utils'
import { CreateProfileDialog } from '~/features/CreateProfile/CreateProfile'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { PencilIcon } from 'lucide-react'
import { EditProfileDialog } from '~/features/EditProfile/EditProfile'
import { ColorPalette } from '~/components/ColorPalette'
import { AnimatePresence } from 'motion/react'
import { useStickyNotes } from '~/features/InteractiveStickyNotes/useStickyNotes'
import { StickyNotes } from '~/features/InteractiveStickyNotes/StickyNotes'
import { useOnlineUsers } from '~/contexts/OnlineUsers'
import { useSendHeartbeat } from '~/hooks/useNotifyOnline'
import { UsersMousePositions } from '~/features/UsersMousePositions/UsersMousePositions'

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
  const [colorPalettePosition, setColorPalettePosition] = useState<{ x: number, y: number } | null>(null)
  const { stickyNotes, createStickyNote, deleteStickyNote } = useStickyNotes()

  const handleSkipToWhiteboard = () => {
    gridRef.current?.focusGrid()
  }

  const handleColorPaletteClick = (color: string) => {
    setColorPalettePosition(null)
    createStickyNote({ id: crypto.randomUUID(), content: '', color, position: colorPalettePosition! }, {
      onError: () => {
        toast.error('Failed to create sticky note')
      }
    })
  }

  const handleDeleteStickyNote = (id: string) => {
    deleteStickyNote(id, {
      onError: () => {
        toast.error('Failed to delete sticky note')
      }
    })
  }

  return (
    <>
      <button
        className='fixed top-0 left-0 z-1000 opacity-0 focus:opacity-10000 transition-opacity duration-300 bg-white p-2 underline pointer-events-none focus:pointer-events-auto'
        onClick={handleSkipToWhiteboard}
      >
        Skip to white board
      </button>
      <header className='fixed z-10 flex w-full items-center justify-between px-4 py-2 pointer-events-none'>
        <img src="/logo.svg" alt="IdeaWall" className='h-10' />
        <HeaderActions />
      </header>

      <div className='fixed h-dvh w-screen'>
        <Grid
          ref={gridRef}
          disabled={!profile}
          width={GRID_WIDTH}
          height={GRID_HEIGHT}
          gridCellSize={GRID_CELL_SIZE}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onHoldClick={({ x, y }) => { setColorPalettePosition({ x, y }) }}
          onFastClick={() => setColorPalettePosition(null)}
        >
          <GridContent>
            <StickyNotes
              stickyNotes={stickyNotes || []}
              onDeleteStickyNote={handleDeleteStickyNote}
              render={(position, renderStickyNote) => (
                <GridItem x={position.x} y={position.y}>
                  {renderStickyNote()}
                </GridItem>
              )}
            />
            <AnimatePresence>
              {colorPalettePosition && (
                <GridItem x={colorPalettePosition.x} y={colorPalettePosition.y} disableScale>
                  <ColorPalette onClick={handleColorPaletteClick} />
                </GridItem>
              )}
            </AnimatePresence>
            <UsersMousePositions render={(position, renderMouseIcon) => (
              <GridItem x={position.x} y={position.y} disableScale>
                {renderMouseIcon()}
              </GridItem>
            )}
            />
          </GridContent>
        </Grid>
      </div>

      {
        <CreateProfileDialog open={!profile} />
      }
    </>
  )
}

function HeaderActions() {
  const { onlineUsers } = useOnlineUsers()

  const renderOnlineUsers = () => {
    return (
      <div className='flex-row hidden sm:flex [&>div:last-child]:mr-3'>
        {
          onlineUsers.slice(0, 4).map((user) => <UserAvatarCircle key={user.id} user={user} />)
        }
        {
          onlineUsers.length > 4 && (
            <div className='w-6 z-100'>
              <div className='bg-white rounded-full p-1 w-10 h-10 flex items-center justify-center'>
                <div className='w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold'>
                  +{onlineUsers.length - 4}
                </div>
              </div>
            </div>
          )
        }
      </div>
    )
  }

  return (
    <div className='flex flex-row gap-1 bg-white rounded-lg py-1 pl-2 pr-3 mt-1 shadow-lg items-center pointer-events-auto'>
      {renderOnlineUsers()}

      <Button size='icon'
        variant='ghost'
        aria-label='Share board link'
        onClick={() => {
          navigator.clipboard.writeText(window.location.href)
          toast.success('Board link copied, share it with your friends!')
        }}
        className='cursor-pointer'
      >
        <img src={ShareIcon} className='size-4' aria-hidden='true' />
      </Button>

      <ProfileButton />
    </div>
  )
}

const UserAvatarCircle = ({ user }: { user: User }) => {
  const labelId = useId()

  return (
    <div className='group w-6 z-100' key={user.id}>
      <div className='relative bg-white rounded-full p-1 w-10 h-10 focus:bg-gray-300 focus:outline-none' aria-describedby={labelId} tabIndex={0}>
        <Avatar className='w-full h-full' {...user.avatarConfig} />
        <div id={labelId} className='absolute top-[100%] left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap bg-gray-200 rounded-full p-1 px-2 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300'>
          {user.name}
        </div>
      </div>
    </div>
  )
}

const ProfileButton = () => {
  const { profile } = useProfile()
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  if (!profile) {
    return (
      <div className={cn('ml-1 p-[2.5px] rounded-full bg-gradient-to-r from-gray-600 to-gray-400 cursor-pointer', profile && 'bg-gradient-to-r from-emerald-600 to-green-400')}>
        <div className='bg-white rounded-full p-[2.5px] w-10 h-10'>
          <div className='w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold'>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button aria-label='Your avatar'>
            <div className={cn('ml-1 p-[2.5px] rounded-full bg-gradient-to-r from-gray-600 to-gray-400 cursor-pointer', profile && 'bg-gradient-to-r from-emerald-600 to-green-400')}>
              <div className='bg-white rounded-full p-[2.5px] w-10 h-10'>
                <Avatar className='w-full h-full' {...profile.avatarConfig} />
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side='bottom'
          align='end'
          sideOffset={10}
          className='p-2'
        >
          <Button variant='ghost'
            size='sm'
            className='w-full cursor-pointer'
            onClick={() => {
              setIsEditingProfile(true)
            }}
          >
            Edit profile <PencilIcon className='w-4 h-4' />
          </Button>
        </PopoverContent>
      </Popover>

      <EditProfileDialog open={isEditingProfile} onClose={() => setIsEditingProfile(false)} />
    </>
  )
}