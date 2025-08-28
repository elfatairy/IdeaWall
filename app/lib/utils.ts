import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { faker } from '@faker-js/faker'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function randomizeNameHelper(sex: 'man' | 'woman' | undefined) {
  if (!sex) {
    return faker.person.fullName()
  }
  const sexMap = {
    man: 'male' as const,
    woman: 'female' as const
  }
  return faker.person.fullName({ sex: sexMap[sex] })
}
