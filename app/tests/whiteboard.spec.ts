import { test, expect, type Page, type BrowserContext } from '@playwright/test'
import { defaultLogin } from './utils/defaultLogin'
import { deleteProfile } from './utils/deleteProfile'
import { drag } from './utils/Mouse/drag'
import { zoom } from './utils/Mouse/zoom'
import { moveToMiddle } from './utils/Mouse/moveToMiddle'
import { moveToTestLocation } from './utils/moveToTestLocatoin'

const isLoggedIn = async (page: Page) => {
  await page.waitForLoadState('networkidle')

  return page
    .getByLabel('Your avatar')
    .isVisible()
    .catch(() => false)
}

test.describe('Whiteboard', () => {
  test('should have correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('IdeaWall')
  })

  test('should render logo', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByAltText('IdeaWall')).toBeVisible()
  })

  // Serial
  test.describe.serial('Authentication Flow', () => {
    let sharedContext: BrowserContext
    let sharedPage: Page

    test.beforeAll(async ({ browser }) => {
      sharedContext = await browser.newContext()
      sharedPage = await sharedContext.newPage()
    })

    test.afterAll(async () => {
      await deleteProfile(sharedPage)
      await sharedContext.close()
    })

    test('should be able to create profile if not logged in', async () => {
      await sharedPage.goto('/')

      if (await isLoggedIn(sharedPage)) {
        return
      }

      await sharedPage.getByRole('button', { name: /Select man/i }).click()
      await expect(sharedPage.getByText('Create Profile')).toBeVisible()
      await sharedPage.getByRole('button', { name: /Randomize avatar/i }).click()
      await sharedPage.getByRole('button', { name: /Randomize name/i }).click()
      await sharedPage.getByRole('textbox', { name: /name/i }).fill('Test User')
      await sharedPage.getByRole('button', { name: /Create/i }).click()
      await expect(sharedPage.getByLabel('Your avatar')).toBeVisible()
    })

    test('should stay logged in after creating profile', async () => {
      await sharedPage.goto('/')
      expect(await isLoggedIn(sharedPage)).toBe(true)
      // await expect(sharedPage.getByLabel('Your avatar')).toBeVisible()
    })
  })

  test.describe.serial('Logged in', () => {
    let sharedContext: BrowserContext
    let sharedPage: Page

    let sharedContext2: BrowserContext
    let sharedPage2: Page

    test.beforeAll(async ({ browser }) => {
      sharedContext = await browser.newContext()
      sharedPage = await sharedContext.newPage()
      sharedContext2 = await browser.newContext()
      sharedPage2 = await sharedContext2.newPage()
      await defaultLogin(sharedPage, 0)
      await defaultLogin(sharedPage2, 1)
    })

    test.afterAll(async () => {
      await sharedContext.close()
      await sharedContext2.close()
    })

    test('should be logged in', async () => {
      await sharedPage.goto('/')
      await sharedPage2.goto('/')
      await expect(sharedPage.getByLabel('Your avatar')).toBeVisible()
      await expect(sharedPage2.getByLabel('Your avatar')).toBeVisible()
    })

    test.describe.serial('Stickynotes', () => {
      test('should be able to create a new stickynote', async () => {
        await sharedPage.goto('/')
        await sharedPage2.goto('/')
        await sharedPage.waitForLoadState('domcontentloaded')
        await sharedPage2.waitForLoadState('domcontentloaded')
        await moveToTestLocation(sharedPage)
        await sharedPage.waitForTimeout(500)
        await sharedPage.mouse.down()
        await sharedPage.waitForTimeout(500)
        await sharedPage.mouse.up({ clickCount: 2 })
        await sharedPage.getByRole('button', { name: /Choose Blue Bell/i }).click({ timeout: 5000 })
        await expect(sharedPage.getByPlaceholder('Write your stickynote here...')).toBeVisible({ timeout: 2000 })
        await sharedPage.getByPlaceholder('Write your stickynote here...').fill('Test stickynote')

        await expect(sharedPage2.getByText('Test stickynote').first()).toBeVisible({ timeout: 1000 })
      })

      test('should be able to react to a stickynote', async () => {
        test.setTimeout(60000)
        await sharedPage.goto('/')
        await sharedPage2.goto('/')
        await sharedPage.waitForLoadState('domcontentloaded')
        await sharedPage2.waitForLoadState('domcontentloaded')
        await moveToTestLocation(sharedPage)
        await moveToTestLocation(sharedPage2)
        await sharedPage.waitForTimeout(500)
        await sharedPage2.locator('text="Test stickynote"').first().click()
        await sharedPage2.getByRole('button', { name: /Love/i }).click()
        await expect(sharedPage.getByText('1', { exact: true })).toBeVisible()
        await expect(sharedPage.getByText('❤️')).toBeVisible()
        await expect(sharedPage2.getByText('1', { exact: true })).toBeVisible()
      })

      test('should be able to delete a stickynote', async () => {
        await sharedPage.goto('/')
        await sharedPage2.goto('/')
        await sharedPage.waitForLoadState('domcontentloaded')
        await sharedPage2.waitForLoadState('domcontentloaded')
        await moveToTestLocation(sharedPage)
        await moveToTestLocation(sharedPage2)
        await sharedPage.waitForTimeout(500)
        await sharedPage.locator('text="Test stickynote"').first().hover()
        await sharedPage.getByRole('button', { name: /Delete note/i }).click()
        await expect(sharedPage.getByText('Test stickynote')).not.toBeVisible()
        await expect(sharedPage2.getByText('Test stickynote')).not.toBeVisible()
      })
    })
  })
})
