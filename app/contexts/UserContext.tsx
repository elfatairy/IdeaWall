import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import type { AvatarConfig } from 'react-nice-avatar'

type User = {
  id: string;
  name: string;
  color: string;
  avatarConfig: AvatarConfig;
  position: {
    x: number;
    y: number;
  };
}

export const ProfileContext = createContext<User | null>(null)

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const user = localStorage.getItem('user')
      if (user) {
        setUser(JSON.parse(user))
      }
    }
    fetchUser()
  }, [])

  return <ProfileContext.Provider value={user}>{children}</ProfileContext.Provider>
}

export const useProfile = () => {
  const user = useContext(ProfileContext)
  return user
}