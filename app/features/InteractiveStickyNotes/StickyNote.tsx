import { allowedReactions, getTextColor } from '~/lib/stickynotes'
import { motion } from 'motion/react'
import { Trash } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { cn, throttle } from '~/lib/utils'
import { useMemo, useState } from 'react'
import { useUpdateStickyNoteContent } from '~/features/InteractiveStickyNotes/useUpdateStickyNoteContent'
import type { StickyNoteReaction, StickyNoteWithReactions } from '~/types/stickynote'
import { useProfile, type User } from '~/contexts/ProfileContext'
import Avatar from 'react-nice-avatar'
import { THROTTLE_TIME } from '~/constants/grid'
import { useReactToStickyNote } from '~/features/InteractiveStickyNotes/useReactToStickyNote'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { censor } from '~/lib/profanity'

type Props = StickyNoteWithReactions & {
  user: User
  onDelete: () => void
}

export function StickyNote({ color, content, user, onDelete, id, sticky_notes_reactions }: Props) {
  const [inputContent, setInputContent] = useState(content)
  const { mutate: updateContentMutation } = useUpdateStickyNoteContent()
  const [isEditing, setIsEditing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const { profile } = useProfile()
  const owner = user.id === profile?.id

  const updateContent = useMemo(() =>
    throttle((newContent: string) => {
      updateContentMutation({ id, content: newContent })
    }, THROTTLE_TIME),
    [id, updateContentMutation]
  )

  const handleContentChange = (newContent: string) => {
    setInputContent(newContent)
    updateContent(newContent)
  }

  const currentReaction = useMemo(() => {
    return sticky_notes_reactions.find((reaction) => reaction.user_id === profile?.id)?.reaction
  }, [sticky_notes_reactions, profile?.id])

  return (
    <Popover>
      <motion.div
        className={cn('relative w-48 h-36 rounded-sm shadow-md hover:shadow-lg cursor-default group', owner ? 'cursor-text' : 'cursor-pointer')}
        style={{
          backgroundColor: color
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: 1,
          scale: isEditing || isHovering ? 1.05 : 1
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        exit={{ opacity: 0, y: -20 }}
        layoutId={`sticky-note-${id}`}
      >
        {
          owner ? (
            <textarea
              dir='auto'
              className='peer p-4 w-full h-full text-sm leading-relaxed font-sans m-0 break-words font-semibold resize-none active:outline-none focus:outline-none'
              style={{ color: getTextColor(color) }}
              value={inputContent}
              maxLength={80}
              placeholder='Write your stickynote here...'
              onFocus={() => {
                setIsEditing(true)
              }}
              onBlur={() => {
                setIsEditing(false)
              }}
              onChange={(e) => handleContentChange(censor(e.target.value))}
            />
          ) : (
            <PopoverTrigger asChild>
              <p dir='auto' className='peer p-4 w-full h-full text-sm leading-relaxed font-sans m-0 break-words font-semibold' style={{ color: getTextColor(color) }}>
                {content}
              </p>
            </PopoverTrigger>
          )
        }
        {owner && <DeleteButton onDelete={onDelete} />}
        <AuthorDetails user={user} owner={owner} />
        <Reactions sticky_notes_reactions={sticky_notes_reactions} />

        <PopoverContent
          side='bottom'
          align='start'
          className='px-2 py-1 w-fit'
          sideOffset={4}
        >
          <ReactionButtons currentReaction={currentReaction} id={id} />
        </PopoverContent>
      </motion.div>
    </Popover>
  )
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <Button
      variant='ghost'
      size='icon'
      className='absolute right-1 bottom-1 w-7 h-7 rounded-full bg-black/10 flex group-focus-within:flex hover:bg-red-500/90 hover:cursor-pointer hover:scale-110 backdrop-blur-sm border border-black/20 hover:border-red-400/50 transition-all duration-200 group opacity-0 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100'
      title="Delete note"
      aria-label="Delete note"
      onClick={onDelete}
    >
      <Trash
        size={12}
        strokeWidth={2.5}
        className='text-gray-700 group-hover:text-white group-focus-within:text-white transition-colors duration-200'
      />
    </Button>
  )
}

function AuthorDetails({ user, owner }: { user: User, owner: boolean }) {
  return (
    <div className='absolute bottom-[calc(100%+4px)] right-1 left-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-focus-within:opacity-100'>
      <Avatar className='w-6 h-6' {...user.avatarConfig} />
      <span className='text-xs font-bold'>{owner ? 'You' : user.name}</span>
    </div>
  )
}

function Reactions({ sticky_notes_reactions }: { sticky_notes_reactions: StickyNoteReaction[] }) {
  if (sticky_notes_reactions.length <= 0) {
    return null
  }
  return (
    <motion.div
      className='w-fit pr-3 absolute -bottom-3 bg-popover rounded-lg p-1 shadow-md right-1 left-1 flex items-center gap-1'
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {Object.entries(sticky_notes_reactions.reduce((acc, reaction) => {
        acc[reaction.reaction || ''] = (acc[reaction.reaction || ''] || 0) + 1
        return acc
      }, {} as Record<string, number>)).map(([reaction, count]) => (
        <div key={reaction} className='text-sm flex items-center' aria-label={`${count} reaction${count > 1 ? 's' : ''} with ${reaction}`}>
          <span aria-hidden={true}>
            {allowedReactions[reaction as keyof typeof allowedReactions]}
          </span>
          <span className='text-xs font-semibold' aria-hidden={true}>{count}</span>
        </div>
      ))}
    </motion.div>
  )
}

function ReactionButtons({ currentReaction, id }: { currentReaction: string | null | undefined, id: string }) {
  const { mutate: reactToStickyNoteMutation } = useReactToStickyNote()
  const { profile } = useProfile()

  return (
    <div className='flex items-center'>
      {Object.entries(allowedReactions).map(([name, icon]) => (
        <button
          key={name}
          className={cn('text-xl p-1 font-bold cursor-pointer hover:bg-slate-300/50 transition-all duration-200 rounded-full leading-6', currentReaction === name && 'bg-slate-300/50')}
          onClick={() => {
            if (!profile?.id) {
              return
            }
            reactToStickyNoteMutation({ userId: profile.id, stickyNoteId: id, reaction: name })
          }}
          aria-label={`React to stickynote with ${name}`}
        >{icon}
        </button>
      ))}
    </div>
  )
}