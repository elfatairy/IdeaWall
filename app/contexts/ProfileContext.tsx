import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'
import type { AvatarConfig } from 'react-nice-avatar'

export type User = {
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
  const [profile, setProfile] = useState<User | null>(JSON.parse(localStorage.getItem('profile') || 'null'))

  const updateProfile = async (newProfile: User) => {
    setProfile(newProfile)
    localStorage.setItem('profile', JSON.stringify(newProfile))
  }

  return <ProfileContext.Provider value={{ profile, setProfile: updateProfile }}>{children}</ProfileContext.Provider>
}

export const useProfile = () => {
  const user = useContext(ProfileContext)
  return user
}