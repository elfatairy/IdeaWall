import { getTextColor } from '~/lib/stickynotes'
import { motion } from 'motion/react'
import { Trash } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '~/lib/utils'

interface Props {
  color: string
  content: string
  owner: boolean
  onDelete: () => void
}

export function StickyNote({ color, content, owner, onDelete }: Props) {
  return (
    <motion.div
      className={cn('relative w-48 min-h-36 rounded-sm shadow-md hover:shadow-lg cursor-default group', owner && 'cursor-text')}
      style={{
        backgroundColor: color
      }}
      initial={{ opacity: 0, scale: 0, rotate: -1 }}
      animate={{
        opacity: 1,
        scale: 1
      }}
      whileHover={{ rotate: 0, scale: 1.05 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className='p-4 h-full flex flex-col'>
        <p className='text-sm leading-relaxed font-sans m-0 break-words font-semibold' style={{ color: getTextColor(color) }}>
          {content}
        </p>
      </div>
      {
        owner && (
          <Button
            variant='ghost'
            size='icon'
            className='absolute top-1 right-1 w-7 h-7 rounded-full bg-black/10 hover:bg-red-500/90 hover:cursor-pointer hover:scale-110 backdrop-blur-sm border border-black/20 hover:border-red-400/50 transition-all duration-200 group opacity-0 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100'
            title="Delete note"
            onClick={onDelete}
          >
            <Trash
              size={12}
              strokeWidth={2.5}
              className='text-gray-700 group-hover:text-white transition-colors duration-200'
            />
          </Button>
        )
      }
    </motion.div>
  )
}