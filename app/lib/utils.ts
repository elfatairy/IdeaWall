import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { faker } from '@faker-js/faker'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function throttle<T extends(...args: Parameters<T>) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastExecTime = 0

  return (...args: Parameters<T>) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = setTimeout(
        () => {
          func(...args)
          lastExecTime = Date.now()
        },
        delay - (currentTime - lastExecTime)
      )
    }
  }
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
