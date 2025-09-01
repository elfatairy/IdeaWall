import { X } from 'lucide-react'
import { stickynoteColors } from '~/lib/stickynotes'
import { motion } from 'motion/react'

function ColorWheelSet({ colors, width, onClick }: { colors: string[], width: number, onClick: (color: string) => void }) {
  return (
    colors.map((color, index) => (
      <motion.button
        key={color}
        className='w-13 h-13 absolute rounded-full cursor-pointer pointer-events-auto shadow-lg'
        initial={{ opacity: 0, scale: 0, translateX: -26, translateY: -26 }}
        animate={{
          opacity: 1,
          scale: 1,
          translateX: width * Math.cos(index / colors.length * 2 * Math.PI) - 26,
          translateY: width * Math.sin(index / colors.length * 2 * Math.PI) - 26
        }}
        exit={{ opacity: 0, scale: 0.5, translateX: -26, translateY: -26 }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 1 }}
        style={{
          backgroundColor: color
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onClick(color)
        }}
      />
    ))
  )
}

interface Props {
  onClick: (color: string) => void
}

export function ColorPalette({ onClick }: Props) {
  return (
    <div className='relative bg-[#ff0]'>
      <motion.div className='absolute -translate-x-1/2 -translate-y-1/2 select-none'
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
      >
        <X size={10} strokeWidth={2} />
      </motion.div>
      <ColorWheelSet colors={stickynoteColors.slice(0, 8)} width={90} onClick={onClick} />
      <ColorWheelSet colors={stickynoteColors.slice(8)} width={150} onClick={onClick} />
    </div>
  )
}