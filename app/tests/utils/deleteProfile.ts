import { supabase } from './supabase'
import type { Page } from '@playwright/test'

export const deleteProfile = async (page: Page) => {
  const currentProfile = JSON.parse((await page.evaluate(() => localStorage.getItem('profile'))) || 'null')
  if (currentProfile) {
    await supabase.from('users').delete().eq('id', currentProfile.id).select().single()
  }
  await page.evaluate(() => localStorage.removeItem('profile'))
}
