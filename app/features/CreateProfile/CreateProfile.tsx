import { Dices, Loader2, Mars, Venus } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import Avatar, { genConfig, type AvatarFullConfig } from 'react-nice-avatar'
import { faker } from '@faker-js/faker'
import { useCreateProfile } from './useCreateProfile'
import { toast } from 'sonner'
import { randomizeNameHelper } from '~/lib/utils'

export function CreateProfileDialog({ open }: { open: boolean }) {
  const { mutate: createProfile, isPending: isCreatingProfile } = useCreateProfile()
  const [sex, setSex] = useState<'man' | 'woman'>()

  const handleBack = () => {
    setSex(undefined)
  }

  const handleSubmit = (name: string, avatar: AvatarFullConfig) => {
    createProfile({ name, avatar }, {
      onSuccess: () => {
        toast.success('Profile created successfully')
      },
      onError: () => {
        toast.error('Failed to create profile')
      }
    })
  }

  const renderDialogContent = () => {
    if (!sex) {
      return <GendersDialog onSelect={setSex} />
    }
    return <NameAvatarDialog sex={sex} onSubmit={handleSubmit} isSubmitting={isCreatingProfile} onBack={handleBack} />
  }

  return (
    <Dialog open={open}>
      <form>
        <DialogContent className='sm:max-w-[425px]' showCloseButton={false}>
          {renderDialogContent()}
        </DialogContent>
      </form>
    </Dialog>
  )
}

function GendersDialog({ onSelect }: { onSelect: (sex: 'man' | 'woman') => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Profile Details</DialogTitle>
      </DialogHeader>
      <div className='flex gap-4'>
        <button className='flex-1 aspect-square rounded-md border hover:bg-cyan-50/50 cursor-pointer group hover:text-cyan-500' onClick={() => onSelect('man')}>
          <div className='flex flex-col items-center justify-center h-full'>
            <Mars size={50} color='currentColor' />
          </div>
        </button>
        <button className='flex-1 aspect-square rounded-md border hover:bg-pink-50/50 cursor-pointer group hover:text-pink-600' onClick={() => onSelect('woman')}>
          <div className='flex flex-col items-center justify-center h-full'>
            <Venus size={50} color='currentColor' />
          </div>
        </button>
      </div>
    </>
  )
}

function NameAvatarDialog({ sex, onSubmit, isSubmitting, onBack }: { sex: 'man' | 'woman', onSubmit: (name: string, avatar: AvatarFullConfig) => void, isSubmitting: boolean, onBack: () => void }) {
  const id = useId()
  const [avatar, setAvatar] = useState<AvatarFullConfig>(() => genConfig({}))
  const [name, setName] = useState<string>(faker.person.fullName())

  const randomizeAvatar = () => {
    setAvatar(genConfig({ sex }))
  }

  const randomizeName = () => {
    setName(randomizeNameHelper(sex))
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
      <DialogFooter className='flex sm:justify-between'>
        <DialogClose asChild>
          <Button variant='outline' onClick={onBack} className='cursor-pointer'>Back</Button>
        </DialogClose>
        <Button type='submit' className='w-20 cursor-pointer' onClick={() => onSubmit(name, avatar)} disabled={isSubmitting}>{isSubmitting ? <Loader2 className='animate-spin' /> : 'Create'}</Button>
      </DialogFooter>
    </>
  )
}