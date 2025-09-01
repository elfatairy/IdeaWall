import { Slider } from '~/components/ui/slider'
import { useGrid } from './useGrid'
import type React from 'react'
import { createContext, Fragment, use, useCallback, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from '~/lib/utils'
import { motion, MotionValue, useTransform } from 'motion/react'

export interface GridRef {
  focusGrid: () => void
}

interface GridProps {
  children?: React.ReactNode
  width?: number
  height?: number
  gridCellSize?: number
  minZoom?: number
  maxZoom?: number
  ref?: React.RefObject<GridRef | null>
  disabled?: boolean
  onFastClick?: ({ x, y }: { x: number; y: number }) => void
  onHoldClick?: ({ x, y }: { x: number; y: number }) => void
  onMouseMove?: ({ x, y }: { x: number; y: number }) => void
}

const GridContext = createContext<{
  width: MotionValue<number>
  height: MotionValue<number>
  x: MotionValue<number>
  y: MotionValue<number>
  zoom: MotionValue<number>
} | null>(null)

export default function Grid({
  children = null,
  width = window.innerWidth * 10,
  height = window.innerHeight * 10,
  gridCellSize = 20,
  minZoom = .1,
  maxZoom = 1,
  ref = undefined,
  disabled = false,
  onFastClick = undefined,
  onHoldClick = undefined,
  onMouseMove = undefined
}: GridProps) {
  const {
    zoomDisplayValue,
    x,
    y,
    containerRef,
    zoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleZoom,
    handleKeyDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useGrid({
    width,
    height,
    minZoom,
    maxZoom,
    gridCellSize: gridCellSize,
    onFastClick,
    onHoldClick,
    onMouseMove
  })

  useImperativeHandle(ref, () => ({
    focusGrid: () => {
      containerRef.current?.focus()
    }
  }))

  const scaledWidth = useTransform(zoom, (zoom) => width * zoom)

  const gridLevels = useMemo(() => Math.ceil(Math.log10(width / gridCellSize)), [width, gridCellSize])

  return (
    <div className='relative h-full w-full'>
      {/* Zoom Controls */}
      <div className='absolute bottom-4 right-4 z-10 flex flex-row gap-2 items-center rounded-lg bg-white p-2 shadow-lg'>
        <Slider
          min={minZoom}
          max={maxZoom}
          value={[zoomDisplayValue]}
          step={0.1}
          onValueChange={(values) => handleZoom(values[0])}
          className='w-40'
          aria-label='Zoom level slider'
        />
        <motion.span className='text-center text-xs font-bold text-gray-600'>x{zoomDisplayValue.toFixed(2)}</motion.span>
      </div>
      {/* Grid Container */}
      <div
        ref={containerRef}
        className={cn('relative h-full w-full', !disabled && 'cursor-grab active:cursor-grabbing')}
        tabIndex={0}
      >
        <motion.div
          style={{
            width: scaledWidth,
            height: scaledWidth,
            x,
            y
          }}
          animate={{
            transition: { duration: 0.01 }
          }}
          onWheel={disabled ? undefined : handleWheel}
          onMouseDown={disabled ? undefined : handleMouseDown}
          onMouseMove={disabled ? undefined : handleMouseMove}
          onMouseUp={disabled ? undefined : handleMouseUp}
          onMouseLeave={disabled ? undefined : handleMouseUp}
          onKeyDown={disabled ? undefined : handleKeyDown}
          onTouchStart={disabled ? undefined : handleTouchStart}
          onTouchMove={disabled ? undefined : handleTouchMove}
          onTouchEnd={disabled ? undefined : handleTouchEnd}
          onTouchCancel={disabled ? undefined : handleTouchEnd}
        >
          <svg className='w-full h-full'>
            <defs>
              {
                Array.from({ length: gridLevels }).map((_, index) => {
                  return (
                    <Fragment key={index}>
                      <GridCell zoom={zoom} cellSize={gridCellSize} index={index} />
                    </Fragment>
                  )
                }
                )
              }
            </defs>
            {
              Array.from({ length: gridLevels }).map((_, index) => {
                return (
                  <rect key={index} width='100%' height='100%' fill={`url(#grid-${index})`} />
                )
              })
            }
          </svg>
          {
            children && (
              <GridContext value={{ width: scaledWidth, height: scaledWidth, x, y, zoom }}>
                {children}
              </GridContext>
            )
          }
        </motion.div>
      </div>

    </div>
  )
}

const GridCell = ({ zoom, cellSize, index }: { zoom: MotionValue<number>, cellSize: number, index: number }) => {
  const scaledCellSize = useTransform(zoom, (_zoom) => cellSize * (10 ** index) * _zoom)
  const scaledStrokeWidth = useTransform(zoom, [0.1 ** index, 0.1 ** (index + 1)], [1, 0.1])

  return (
    <motion.pattern
      key={index}
      id={`grid-${index}`}
      style={{
        width: scaledCellSize,
        height: scaledCellSize
      }}
      patternUnits='userSpaceOnUse'
    >
      <motion.path
        d={`M ${cellSize * 10 ** index} 0 L 0 0 0 ${cellSize * 10 ** index}`}
        fill='none'
        stroke='var(--color-gray-400)'
        strokeWidth={scaledStrokeWidth}
        opacity={0.5}
      />
    </motion.pattern>
  )
}

const useGridContentContext = () => {
  const context = use(GridContext)
  if (!context) {
    throw new Error('GridContent must be used within a GridContent')
  }
  return context
}

export const GridContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='absolute inset-0'>
      {children}
    </div>
  )
}

export const GridItem = ({ children, x, y, disableScale = false, zIndex = undefined }: { children: React.ReactNode, x: number, y: number, disableScale?: boolean, zIndex?: number }) => {
  const { width, height, zoom } = useGridContentContext()
  const itemRef = useRef<HTMLDivElement>(null)
  const [itemSize, setItemSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (itemRef.current) {
      setItemSize({ width: itemRef.current.offsetWidth, height: itemRef.current.offsetHeight })
    }
  }, [])

  const translateX = useTransform(width, (_width) => _width / 2 + x * zoom.get() - itemSize.width / 2)
  const translateY = useTransform(height, (_height) => _height / 2 + y * zoom.get() - itemSize.height / 2)

  return (
    <motion.div
      ref={itemRef}
      className={'absolute z-10 hover:z-21 focus-within:z-20'}
      style={{
        x: translateX,
        y: translateY,
        scale: disableScale ? 1 : zoom,
        zIndex: zIndex
      }}
    >
      {children}
    </motion.div>
  )
}