import Grid, { GridItem, type GridRef } from '~/features/Grid/Grid'
import { GRID_CELL_SIZE, GRID_HEIGHT, GRID_WIDTH, MAX_ZOOM, MIN_ZOOM, THROTTLE_TIME } from '~/constants/grid'
import { AnimatePresence } from 'motion/react'
import { StickyNotes } from '~/features/InteractiveStickyNotes/StickyNotes'
import { ColorPalette } from '~/components/ColorPalette'
import { useStickyNotes } from '~/features/InteractiveStickyNotes/useStickyNotes'
import { useProfile } from '~/contexts/ProfileContext'
import { useMemo, useState } from 'react'
import { UsersMousePositions } from '~/features/UsersMousePositions/UsersMousePositions'
import { useUpdateUserPosition } from '~/hooks/useUpdateUserPosition'
import { toast } from 'sonner'
import { throttle } from '~/lib/utils'

interface Props {
  gridRef: React.RefObject<GridRef | null>
}

export const MainGrid = ({ gridRef }: Props) => {
  const { profile } = useProfile()
  const [colorPalettePosition, setColorPalettePosition] = useState<{ x: number, y: number } | null>(null)
  const { stickyNotes, createStickyNote, deleteStickyNote } = useStickyNotes()
  const { mutate: updateUserPosition } = useUpdateUserPosition()

  const handleColorPaletteClick = (color: string) => {
    setColorPalettePosition(null)
    createStickyNote({ id: crypto.randomUUID(), content: '', color, position: colorPalettePosition!, sticky_notes_reactions: [] }, {
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

  const throttledUpdateUserPosition = useMemo(() => {
    return throttle((position: { x: number; y: number }) => {
      if (!profile?.id) {
        return
      }
      updateUserPosition(position)
    }, THROTTLE_TIME)
  }, [updateUserPosition, profile?.id])

  return (
    <div className='fixed h-dvh w-screen'>
      <Grid
        ref={gridRef || undefined}
        disabled={!profile}
        width={GRID_WIDTH}
        height={GRID_HEIGHT}
        gridCellSize={GRID_CELL_SIZE}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        onHoldClick={({ x, y }) => { setColorPalettePosition({ x, y }) }}
        onFastClick={() => setColorPalettePosition(null)}
        onMouseMove={throttledUpdateUserPosition}
      >
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
            <GridItem x={colorPalettePosition.x} y={colorPalettePosition.y} disableScale fixedZIndex={40}>
              <ColorPalette onClick={handleColorPaletteClick} />
            </GridItem>
          )}
        </AnimatePresence>
        <UsersMousePositions render={(position, renderMouseIcon) => (
          <GridItem x={position.x} y={position.y} disableScale fixedZIndex={50}>
            {renderMouseIcon()}
          </GridItem>
        )}
        />
      </Grid>
    </div>
  )
}