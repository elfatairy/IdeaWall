import { zoom } from './Mouse/zoom'
import { drag } from './Mouse/drag'
import type { Page } from '@playwright/test'
import { moveToMiddle } from './Mouse/moveToMiddle'

export const moveToTestLocation = async (page: Page) => {
  await zoom(page, 'left', 9)
  await drag(page, 900, 900)
  await zoom(page, 'right', 9)
  await moveToMiddle(page)
}