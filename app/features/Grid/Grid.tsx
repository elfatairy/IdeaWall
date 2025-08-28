import { Slider } from '~/components/ui/slider'
import { useGrid } from './useGrid'
import type React from 'react'
import { createContext, use, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '~/lib/utils'

export interface GridRef {
  focusGrid: () => void
}

interface GridProps {
  children?: React.ReactNode
  width?: number
  height?: number
  gridSize?: number
  minZoom?: number
  maxZoom?: number
  ref?: React.RefObject<GridRef | null>
  disabled?: boolean
}

const GridContext = createContext<{
  width: number
  height: number
  pan: {
    x: number
    y: number
  }
  zoom: number
} | null>(null)

export default function Grid({
  children = null,
  width = window.innerWidth * 10,
  height = window.innerHeight * 10,
  gridSize = 20,
  minZoom = .1,
  maxZoom = 1,
  ref = undefined,
  disabled = false
}: GridProps) {
  const { zoom, pan, containerRef, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleZoom, handleKeyDown, handleTouchStart, handleTouchMove, handleTouchEnd } = useGrid(
    width,
    height,
    minZoom,
    maxZoom
  )
  const scaledGridSize = gridSize * zoom

  useImperativeHandle(ref, () => ({
    focusGrid: () => {
      containerRef.current?.focus()
    }
  }))

  return (
    <div className='relative h-full w-full'>
      {/* Zoom Controls */}
      <div className='absolute bottom-4 right-4 z-10 flex flex-row gap-2 items-center rounded-lg bg-white p-2 shadow-lg'>
        <Slider min={minZoom} max={maxZoom} value={[zoom]} step={0.1} onValueChange={(values) => handleZoom(values[0])} className='w-40' aria-label='Zoom level slider' />
        <div className='text-center text-xs font-bold text-gray-600'>x{zoom.toFixed(2)}</div>
      </div>
      {/* Grid Container */}
      <div
        ref={containerRef}
        className={cn('relative h-full w-full', !disabled && 'cursor-grab active:cursor-grabbing')}
        tabIndex={0}
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
        <svg
          width={width * zoom}
          height={height * zoom}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`
          }}
        >
          <defs>
            <pattern id='grid-1' width={scaledGridSize} height={scaledGridSize} patternUnits='userSpaceOnUse'>
              <path
                d={`M ${scaledGridSize} 0 L 0 0 0 ${scaledGridSize}`}
                fill='none'
                stroke='var(--color-gray-400)'
                strokeWidth={1 * zoom}
                opacity={0.5}
              />
            </pattern>
            <pattern id='grid-2' width={scaledGridSize * 10} height={scaledGridSize * 10} patternUnits='userSpaceOnUse'>
              <path
                d={`M ${scaledGridSize * 10} 0 L 0 0 0 ${scaledGridSize * 10}`}
                fill='none'
                stroke='var(--color-gray-400)'
                strokeWidth={1}
                opacity={0.5}
              />
            </pattern>
            <pattern id='grid-3' width={scaledGridSize * 100} height={scaledGridSize * 100} patternUnits='userSpaceOnUse'>
              <path
                d={`M ${scaledGridSize * 100} 0 L 0 0 0 ${scaledGridSize * 100}`}
                fill='none'
                stroke='var(--color-gray-400)'
                strokeWidth={1}
                opacity={0.5}
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#grid-1)' />
          <rect width='100%' height='100%' fill='url(#grid-2)' />
          <rect width='100%' height='100%' fill='url(#grid-3)' />
        </svg>
        {
          children && (
            <GridContext value={{ width: width * zoom, height: height * zoom, pan, zoom }}>
              {children}
            </GridContext>
          )
        }
      </div>
    </div>
  )
}

export const GridContent = ({ children }: { children: React.ReactNode }) => {
  const context = use(GridContext)

  if (!context) {
    throw new Error('GridContent must be used within a Grid')
  }

  const { width, height, pan } = context

  return (
    <div
      className='absolute top-0 left-0'
      style={{
        width: width,
        height: height,
        transform: `translate(${pan.x}px, ${pan.y}px)`
      }}
    >
      {children}
    </div>
  )
}

export const GridItem = ({ children, x, y }: { children: React.ReactNode, x: number, y: number }) => {
  const context = use(GridContext)
  const itemRef = useRef<HTMLDivElement>(null)
  const [itemSize, setItemSize] = useState<{ width: number, height: number }>({ width: 0, height: 0 })

  if (!context) {
    throw new Error('GridItem must be used within a Grid')
  }

  const { width, height, zoom } = context

  useLayoutEffect(() => {
    if (itemRef.current) {
      setItemSize({ width: itemRef.current.offsetWidth, height: itemRef.current.offsetHeight })
    }
  }, [])

  return (
    <div
      ref={itemRef}
      className='absolute z-10'
      style={{
        top: height / 2,
        left: width / 2,
        transform: `translate(${-itemSize.width / 2 + x * zoom}px, ${-itemSize.height / 2 + y * zoom}px) scale(${zoom})`
      }}
    >
      {children}
    </div>
  )
}