import { AnimatePresence } from 'motion/react'
import { useUsersMousePositions } from './useUsersMousePositions'
import { Fragment } from 'react/jsx-runtime'
import { MousePointer2 } from 'lucide-react'
import { useProfile } from '~/contexts/ProfileContext'

interface Props {
  render: (position: { x: number, y: number }, MouseIcon: () => React.ReactNode) => React.ReactNode
}

export function UsersMousePositions({ render }: Props) {
  const { users } = useUsersMousePositions()
  const { profile } = useProfile()

  return (
    <AnimatePresence>
      {users.filter((user) => user.position !== null && user.id !== profile?.id).map((user) => (
        <Fragment key={user.id}>
          {render(user.position, () => (
            <MousePointer2 size={16} color={user.avatarConfig.bgColor} />
          ))}
        </Fragment>
      ))}
    </AnimatePresence>
  )
}