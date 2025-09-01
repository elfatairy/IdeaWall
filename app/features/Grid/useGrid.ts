import type React from 'react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useDeferredValue } from 'react'
import { throttle } from '../../lib/utils'
import { useMotionValue } from 'motion/react'
import { THROTTLE_TIME } from '~/constants/grid'

interface Props {
  width: number
  height: number
  minZoom: number
  maxZoom: number
  gridCellSize: number
  disabled?: boolean
  onMouseMove?: ({ x, y }: { x: number; y: number }) => void
  onFastClick?: ({ x, y }: { x: number; y: number }) => void
  onHoldClick?: ({ x, y }: { x: number; y: number }) => void
}

export const useGrid = ({ width, height, minZoom, maxZoom, onFastClick, onHoldClick, onMouseMove }: Props) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const zoom = useMotionValue(1)
  const [zoomDisplayValue, setZoomDisplayValue] = useState(1)
  const zoomDisplayValueDeferred = useDeferredValue(zoomDisplayValue)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHolding, setIsHolding] = useState(false)
  const isHoldingRef = useRef(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const holdingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fastClickTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getViewPort = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) {
      return { width: 0, height: 0 }
    }
    return rect
  }, [containerRef])

  const setPan = useCallback(
    (newPosition: { x: number; y: number }) => {
      const viewPort = getViewPort()

      x.set(Math.max(Math.min(0, newPosition.x), viewPort.width - width * zoom.get()))
      y.set(Math.max(Math.min(0, newPosition.y), viewPort.height - height * zoom.get()))
    },
    [getViewPort, x, width, zoom, y, height]
  )

  const movePan = useCallback(
    (distance: { x?: number; y?: number }) => {
      setPan({ x: x.get() + (distance.x ?? 0), y: y.get() + (distance.y ?? 0) })
    },
    [setPan, x, y]
  )

  const setZoom = useCallback(
    (newZoom: number) => {
      const viewPort = getViewPort()
      if (!viewPort) {
        return
      }
      const rectWidth = viewPort.width
      const rectHeight = viewPort.height
      newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))
      const zoomRatio = newZoom / zoom.get()
      const newX = ((1 - zoomRatio) * rectWidth) / 2 + x.get() * zoomRatio
      const newY = ((1 - zoomRatio) * rectHeight) / 2 + y.get() * zoomRatio
      x.set(Math.max(Math.min(0, newX), rectWidth - width * newZoom))
      y.set(Math.max(Math.min(0, newY), rectHeight - height * newZoom))

      zoom.set(newZoom)
      setZoomDisplayValue(newZoom)
    },
    [zoom, setZoomDisplayValue, getViewPort, minZoom, maxZoom, width, height, x, y]
  )

  const resetPan = useCallback(() => {
    const viewPort = getViewPort()
    if (viewPort) {
      x.set(viewPort.width / 2 - width / 2)
      y.set(viewPort.height / 2 - height / 2)
    }
  }, [getViewPort, width, height, x, y])

  useLayoutEffect(() => {
    resetPan()
  }, [resetPan])

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
    },
    [minZoom, maxZoom, setZoom]
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

        handleZoom(delta * zoom.get())
      }, THROTTLE_TIME),
    [handleZoom, zoom]
  )

  const handleStartHolding = useCallback(
    (position: { x: number; y: number }) => {
      setIsHolding(true)
      isHoldingRef.current = true
      setDragStart(position)
      if (onHoldClick) {
        holdingTimeoutRef.current = setTimeout(() => {
          if (!isHoldingRef.current) {
            return
          }

          const pos = {
            x: position.x / zoom.get() - width / 2,
            y: position.y / zoom.get() - height / 2
          }
          onHoldClick({
            x: pos.x,
            y: pos.y
          })
        }, 300)
      }
      if (onFastClick) {
        fastClickTimeoutRef.current = setTimeout(() => {
          if (!isHoldingRef.current) {
            return
          }
          onFastClick({ x: position.x - (width * zoom.get()) / 2, y: position.y - (height * zoom.get()) / 2 })
        }, 100)
      }
    },
    [onHoldClick, onFastClick, width, zoom, height]
  )

  const handleMoving = useCallback(
    (position: { x: number; y: number }) => {
      if (isHolding) {
        if (holdingTimeoutRef.current) {
          clearTimeout(holdingTimeoutRef.current)
        }
        if (fastClickTimeoutRef.current) {
          clearTimeout(fastClickTimeoutRef.current)
        }
        setPan({
          x: position.x - dragStart.x,
          y: position.y - dragStart.y
        })
      }
      const viewPort = getViewPort()
      if (!viewPort) {
        return
      }
      if (onMouseMove) {
        onMouseMove({
          x: (position.x - viewPort.width / 2) / zoom.get(),
          y: (position.y - viewPort.height / 2) / zoom.get()
        })
      }
    },
    [isHolding, getViewPort, onMouseMove, setPan, dragStart.x, dragStart.y, zoom]
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
        handleStartHolding({ x: e.clientX - x.get(), y: e.clientY - y.get() })
      }
    },
    [handleStartHolding, x, y]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStartHolding({ x: e.touches[0].clientX - x.get(), y: e.touches[0].clientY - y.get() })
    },
    [handleStartHolding, x, y]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMoving({
        x: e.clientX,
        y: e.clientY
      })
    },
    [handleMoving]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMoving({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    },
    [handleMoving, dragStart.x, dragStart.y]
  )

  const handleMouseUp = useCallback(() => {
    handleEndHolding()
  }, [handleEndHolding])

  const handleTouchEnd = useCallback(() => {
    handleEndHolding()
  }, [handleEndHolding])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        movePan({ y: 10 })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        movePan({ y: -10 })
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        movePan({ x: 10 })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        movePan({ x: -10 })
      }
    },
    [movePan]
  )

  const resetZoom = () => {
    setZoom(1)
    resetPan()
  }

  return {
    zoom,
    zoomDisplayValue: zoomDisplayValueDeferred,
    x,
    y,
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
