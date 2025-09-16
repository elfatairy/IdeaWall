import type { Page } from '@playwright/test'
import { moveToMiddle } from './moveToMiddle'

const SAFE_X_PADDING = 30
const SAFE_Y_PADDING = 50

export async function drag(page: Page, dx: number, dy: number): Promise<void> {
	const viewportSize = page.viewportSize()
	const windowMiddleX = viewportSize?.width ? viewportSize.width / 2 : 640
	const windowMiddleY = viewportSize?.height ? viewportSize.height / 2 : 360

  let movedX = 0
  let movedY = 0

  while (movedX < dx || movedY < dy) {
    await moveToMiddle(page)
    await page.mouse.down({ button: 'left' })

    const xStep = Math.min(dx - movedX, windowMiddleX - SAFE_X_PADDING)
    const yStep = Math.min(dy - movedY, windowMiddleY - SAFE_Y_PADDING)

    await page.mouse.move(windowMiddleX + xStep, windowMiddleY + yStep)
    await page.mouse.up({ button: 'left' })
    await page.mouse.up({ button: 'left' })

    movedX += xStep
    movedY += yStep
  }
}