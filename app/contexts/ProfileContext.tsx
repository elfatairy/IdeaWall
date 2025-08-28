import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import type { AvatarConfig } from 'react-nice-avatar'

type User = {
  id: string;
  name: string;
  avatarConfig: AvatarConfig;
  position: {
    x: number;
    y: number;
  };
}

type ProfileContextType = {
  profile: User | null
  setProfile: (profile: User) => void
}

export const ProfileContext = createContext<ProfileContextType>({ profile: null, setProfile: async () => { } })

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const profile = localStorage.getItem('profile')
      if (profile) {
        setProfile(JSON.parse(profile))
      }
    }
    fetchUser()
  }, [])

  const updateProfile = async (profile: User) => {
    setProfile(profile)
    localStorage.setItem('profile', JSON.stringify(profile))
  }

  return <ProfileContext.Provider value={{ profile, setProfile: updateProfile }}>{children}</ProfileContext.Provider>
}

export const useProfile = () => {
  const user = useContext(ProfileContext)
  return user
}