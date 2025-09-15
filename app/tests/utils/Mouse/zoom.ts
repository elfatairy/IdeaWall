import type { Page } from '@playwright/test'
import { moveToMiddle } from './moveToMiddle'

export async function zoom(page: Page, amount: number): Promise<void> {
  await moveToMiddle(page)

  if (amount > 0) {
    for (let i = 0; i < amount; i++) {
      await page.mouse.wheel(0, 1)
    }
  } else {
    for (let i = 0; i > amount; i--) {
      await page.mouse.wheel(0, -1)
    }
  }
}