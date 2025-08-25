import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export const useGrid = (width: number, height: number, minZoom: number, maxZoom: number) => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: -width / 2, y: -height / 2 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const resetPan = () => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setPan({ x: rect.width / 2 - width / 2, y: rect.height / 2 - height / 2 })
    }
  }

  useLayoutEffect(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setPan({ x: rect.width / 2 - width / 2, y: rect.height / 2 - height / 2 })
    }
  }, [width, height])

  // Zoom handlers
  const handleZoom = useCallback(
    (newZoom: number) => {
      newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))
      setZoom(newZoom)
      const rect = containerRef.current?.getBoundingClientRect()
      const rectWidth = rect?.width ?? 0
      const rectHeight = rect?.height ?? 0

      const zoomRatio = newZoom / zoom
      console.log(pan.x, width * newZoom - rectWidth, ((1 - zoomRatio) * rectWidth) / 2 + (pan.x * newZoom) / zoom)
      setPan((prevPan) => {
        const newX = ((1 - zoomRatio) * rectWidth) / 2 + prevPan.x * zoomRatio
        const newY = ((1 - zoomRatio) * rectHeight) / 2 + prevPan.y * zoomRatio
        return {
          x: Math.max(Math.min(0, newX), rectWidth - width * newZoom),
          y: Math.max(Math.min(0, newY), rectHeight - height * newZoom)
        }
      })
    },
    [minZoom, maxZoom, zoom]
  )

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      // const centerX = e.clientX - rect.left
      // const centerY = e.clientY - rect.top
      const delta = e.deltaY > 0 ? 0.9 : 1.1

      handleZoom(delta)
    },
    [handleZoom]
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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const rect = containerRef.current?.getBoundingClientRect()
        const rectWidth = rect?.width ?? 0
        const rectHeight = rect?.height ?? 0
        setPan({
          x: Math.max(Math.min(0, e.clientX - dragStart.x), rectWidth - width * zoom),
          y: Math.max(Math.min(0, e.clientY - dragStart.y), rectHeight - height * zoom)
        })
      }
    },
    [isDragging, dragStart.x, dragStart.y]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Zoom controls
  const zoomIn = () => handleZoom(1.2)
  const zoomOut = () => handleZoom(0.8)
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
    handleMouseMove,
    handleMouseUp,
    handleZoom,
    resetZoom
  }
}
