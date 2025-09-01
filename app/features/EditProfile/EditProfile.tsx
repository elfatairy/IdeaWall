import { Dices, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import Avatar, { genConfig, type AvatarFullConfig } from 'react-nice-avatar'
import { useEditProfile } from './useEditProfile'
import { toast } from 'sonner'
import { useProfile, type User } from '~/contexts/ProfileContext'
import { randomizeNameHelper } from '~/lib/utils'

export function EditProfileDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { profile } = useProfile()
  const { editProfile, isLoading: isEditingProfile } = useEditProfile()

  const handleSubmit = async (name: string, avatar: AvatarFullConfig) => {
    const result = await editProfile(name, avatar)
    if (result.success) {
      toast.success('Profile updated successfully')
      onClose()
    } else {
      toast.error('Failed to update profile')
    }
  }

  if (!profile) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <form>
        <DialogContent className='sm:max-w-[425px]'>
          <NameAvatarDialog onSubmit={handleSubmit} isSubmitting={isEditingProfile} profile={profile} />
        </DialogContent>
      </form>
    </Dialog>
  )
}

function NameAvatarDialog({ onSubmit, isSubmitting, profile }: { onSubmit: (name: string, avatar: AvatarFullConfig) => void, isSubmitting: boolean, profile: User }) {
  const id = useId()
  const [avatar, setAvatar] = useState<AvatarFullConfig>(profile.avatarConfig)
  const [name, setName] = useState<string>(profile.name)

  const randomizeAvatar = () => {
    setAvatar(genConfig({ sex: avatar.sex }))
  }

  const randomizeName = () => {
    setName(randomizeNameHelper(avatar.sex))
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Profile Details</DialogTitle>
      </DialogHeader>
      <div className='flex justify-center'>
        <div className='relative w-44 h-44'>
          <Avatar className='w-full h-full' {...avatar} />
          <button className='absolute bottom-0 right-0 bg-white rounded-full p-2 cursor-pointer hover:bg-gray-100' onClick={randomizeAvatar}>
            <Dices size={36} />
          </button>
        </div>
      </div>
      <div className='flex justify-center'>
        <div className='relative flex gap-2 justify-center sm:max-w-[200px]'>
          <Input id={id} value={name} onChange={(e) => setName(e.target.value)} className='text-center w-full' />
          <Button variant='outline' onClick={randomizeName} size='icon' className='cursor-pointer absolute top-0 left-[calc(100%+10px)]'>
            <Dices />
          </Button>
        </div>
      </div>
      <DialogFooter className='flex sm:justify-center'>
        <DialogClose asChild>
          <Button variant='outline' className='cursor-pointer'>Cancel</Button>
        </DialogClose>
        <Button type='submit' className='sm:w-20 cursor-pointer' onClick={() => onSubmit(name, avatar)} disabled={isSubmitting}>{isSubmitting ? <Loader2 className='animate-spin' /> : 'Submit'}</Button>
      </DialogFooter>
    </>
  )
}