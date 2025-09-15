import type { Page } from '@playwright/test'

export async function moveToMiddle(page: Page): Promise<void> {
	const viewportSize = page.viewportSize()
	const windowMiddleX = viewportSize?.width ? viewportSize.width / 2 : 640
	const windowMiddleY = viewportSize?.height ? viewportSize.height / 2 : 360

  await page.mouse.move(windowMiddleX, windowMiddleY)
}