import { useGrid } from './useGrid'

interface GridProps {
  width?: number
  height?: number
  gridSize?: number
  minZoom?: number
  maxZoom?: number
}

export default function Grid({
  width = window.innerWidth * 10,
  height = window.innerHeight * 10,
  gridSize = 20,
  minZoom = .1,
  maxZoom = 1
}: GridProps) {
  const { zoom, pan, containerRef, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, zoomIn, zoomOut, resetZoom } = useGrid(
    width,
    height,
    minZoom,
    maxZoom
  )
  const scaledGridSize = gridSize * zoom

  return (
    <div className='relative h-full w-full'>
      {/* Zoom Controls */}
      <div className='absolute top-4 right-4 z-10 flex flex-col gap-2 rounded-lg bg-white p-2 shadow-lg'>
        <button
          onClick={zoomIn}
          className='flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-white transition-colors hover:bg-blue-600'
          title='Zoom In'
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className='flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-white transition-colors hover:bg-blue-600'
          title='Zoom Out'
        >
          -
        </button>
        <button
          onClick={resetZoom}
          className='flex h-8 w-8 items-center justify-center rounded bg-gray-500 text-xs text-white transition-colors hover:bg-gray-600'
          title='Reset Zoom'
        >
          ⌂
        </button>
        <div className='text-center text-xs text-gray-600'>{Math.round(zoom * 100)}%</div>
      </div>
      {/* Grid Container */}
      <div
        ref={containerRef}
        className='h-full w-full cursor-grab active:cursor-grabbing'
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
      </div>
    </div>
  )
}
