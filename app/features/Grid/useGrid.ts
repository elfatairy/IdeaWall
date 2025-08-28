import type React from 'react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react'
import { throttle } from '../../lib/utils'

interface Props {
  width: number
  height: number
  minZoom: number
  maxZoom: number
  disabled?: boolean
  onFastClick?: ({ x, y }: { x: number; y: number }) => void
  onHoldClick?: ({ x, y }: { x: number; y: number }) => void
}

export const useGrid = ({ width, height, minZoom, maxZoom, disabled, onFastClick, onHoldClick }: Props) => {
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHolding, setIsHolding] = useState(false)
  const isHoldingRef = useRef(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const holdingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fastClickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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

  useEffect(() => {
    if (isHolding) {
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.userSelect = ''
    }

    return () => {
      document.body.style.userSelect = ''
    }
  }, [isHolding])

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
  const handleWheel = useMemo(
    () =>
      throttle((e: React.WheelEvent) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) {
          return
        }

        const delta = e.deltaY > 0 ? 0.9 : 1.1

        handleZoom(delta * zoom)
      }, 33),
    [handleZoom, zoom]
  )

  const handleStartHolding = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      setIsHolding(true)
      isHoldingRef.current = true
      setDragStart({ x, y })
      if (onHoldClick) {
        holdingTimeoutRef.current = setTimeout(() => {
          if (!isHoldingRef.current) {
            return
          }
          onHoldClick({ x: x - width / 2, y: y - height / 2 })
        }, 300)
      }
      if (onFastClick) {
        fastClickTimeoutRef.current = setTimeout(() => {
          if (!isHoldingRef.current) {
            return
          }
          onFastClick({ x: x - width / 2, y: y - height / 2 })
        }, 100)
      }
    },
    [onHoldClick, onFastClick, width, height]
  )

  const handleDrag = useCallback(
    ({ x, y }: { x: number; y: number }) => {
      if (isHolding) {
        if (holdingTimeoutRef.current) {
          clearTimeout(holdingTimeoutRef.current)
        }
        if (fastClickTimeoutRef.current) {
          clearTimeout(fastClickTimeoutRef.current)
        }
        dispatchPan({ type: 'set', x, y })
      }
    },
    [isHolding]
  )

  const handleEndHolding = useCallback(() => {
    setIsHolding(false)
    isHoldingRef.current = false
    if (fastClickTimeoutRef.current) {
      clearTimeout(fastClickTimeoutRef.current)
    }
    if (holdingTimeoutRef.current) {
      clearTimeout(holdingTimeoutRef.current)
    }
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        handleStartHolding({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      }
    },
    [handleStartHolding, pan.x, pan.y]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStartHolding({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y })
    },
    [handleStartHolding, pan.x, pan.y]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleDrag({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    },
    [handleDrag, dragStart.x, dragStart.y]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleDrag({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    },
    [handleDrag, dragStart.x, dragStart.y]
  )

  const handleMouseUp = useCallback(() => {
    handleEndHolding()
  }, [handleEndHolding])

  const handleTouchEnd = useCallback(() => {
    handleEndHolding()
  }, [handleEndHolding])

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
