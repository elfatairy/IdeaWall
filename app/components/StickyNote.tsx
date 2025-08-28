import { getTextColor } from '~/lib/stickynotes'

export function StickyNote({ color, content }: { color: string, content: string }) {
  return (
    <div
      className='w-48 min-h-36 rounded-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer transform -rotate-1 hover:rotate-0'
      style={{ backgroundColor: color }}
    >
      <div className='p-4 h-full flex flex-col'>
        <p className='text-sm leading-relaxed font-sans m-0 break-words font-semibold' style={{ color: getTextColor(color) }}>
          {content}
        </p>
      </div>
    </div>
  )
}