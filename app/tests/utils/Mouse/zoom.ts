import type { Page } from '@playwright/test'

export async function zoom(page: Page, direction: 'left' | 'right', amount: number): Promise<void> {
  await page.getByLabel('Slider thumb').click()
  for (let i = 0; i < amount; i++) {
    await page.keyboard.press(direction === 'left' ? 'ArrowLeft' : 'ArrowRight')
    await page.waitForTimeout(50)
  }
}