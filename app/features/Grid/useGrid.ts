import type React from 'react'
import { useCallback, useLayoutEffect, useReducer, useRef, useState } from 'react'

export const useGrid = (width: number, height: number, minZoom: number, maxZoom: number) => {
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pan, dispatchPan] = useReducer(
    (
      prev: { x: number; y: number },
      action: {
        type: 'set' | 'move' | 'zoom' | 'reset'
        x?: number
        y?: number
        prevZoom?: number
        newZoom?: number
      }
    ) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) {
        return prev
      }
      const rectWidth = rect.width
      const rectHeight = rect.height

      switch (action.type) {
        case 'set':
          if (!action.x || !action.y) {
            return prev
          }

          return {
            x: Math.max(Math.min(0, action.x), rectWidth - width * zoom),
            y: Math.max(Math.min(0, action.y), rectHeight - height * zoom)
          }
        case 'move':
          return {
            x: Math.max(Math.min(0, prev.x + (action.x ?? 0)), rectWidth - width * zoom),
            y: Math.max(Math.min(0, prev.y + (action.y ?? 0)), rectHeight - height * zoom)
          }
        case 'zoom':
          if (!action.newZoom || !action.prevZoom) {
            return prev
          }
          const newZoom = Math.max(minZoom, Math.min(maxZoom, action.newZoom))
          const zoomRatio = newZoom / action.prevZoom
          const newX = ((1 - zoomRatio) * rectWidth) / 2 + prev.x * zoomRatio
          const newY = ((1 - zoomRatio) * rectHeight) / 2 + prev.y * zoomRatio
          return {
            x: Math.max(Math.min(0, newX), rectWidth - width * newZoom),
            y: Math.max(Math.min(0, newY), rectHeight - height * newZoom)
          }
        case 'reset':
          return {
            x: rectWidth / 2 - width / 2,
            y: rectHeight / 2 - height / 2
          }
      }
    },
    {
      x: -width / 2,
      y: -height / 2
    }
  )
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const resetPan = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      dispatchPan({
        type: 'reset'
      })
    }
  }

  useLayoutEffect(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      dispatchPan({
        type: 'set',
        x: rect.width / 2 - width / 2,
        y: rect.height / 2 - height / 2
      })
    }
  }, [width, height])

  // Zoom handlers
  const handleZoom = useCallback(
    (newZoom: number) => {
      newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))
      setZoom(newZoom)
      dispatchPan({
        type: 'zoom',
        prevZoom: zoom,
        newZoom
      })
    },
    [minZoom, maxZoom, zoom]
  )

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) {
        return
      }

      const delta = e.deltaY > 0 ? 0.9 : 1.1

      handleZoom(delta * zoom)
    },
    [handleZoom, zoom]
  )

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        // Left click only
        setIsDragging(true)
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      }
    },
    [pan]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y })
    },
    [pan]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging) {
        dispatchPan({
          type: 'set',
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y
        })
      }
    },
    [isDragging, dragStart.x, dragStart.y]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        dispatchPan({
          type: 'set',
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        })
      }
    },
    [isDragging, dragStart.x, dragStart.y]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      dispatchPan({ type: 'move', y: 10 })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      dispatchPan({ type: 'move', y: -10 })
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      dispatchPan({ type: 'move', x: 10 })
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      dispatchPan({ type: 'move', x: -10 })
    }
  }, [])

  const resetZoom = () => {
    setZoom(1)
    resetPan()
  }

  return {
    zoom,
    pan,
    containerRef,
    handleWheel,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseMove,
    handleMouseUp,
    handleZoom,
    resetZoom,
    handleKeyDown
  }
}
