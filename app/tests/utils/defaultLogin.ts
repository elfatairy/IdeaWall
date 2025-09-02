import type { Page } from '@playwright/test'

export const defaultLogin = async (page: Page, account: number) => {
  // Navigate to the page first to ensure proper origin for localStorage access
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  await page.evaluate((account) => {
    const accounts = [
      {
        profile:
          '{"id":"218abb6f-94a0-4182-bf38-326f1bd21fb7","name":"Test User","avatarConfig":{"sex":"man","faceColor":"#F9C9B6","earSize":"small","eyeStyle":"circle","noseStyle":"long","mouthStyle":"smile","shirtStyle":"polo","glassesStyle":"none","hairColor":"#000","hairStyle":"normal","hatStyle":"none","hatColor":"#FC909F","eyeBrowStyle":"up","shirtColor":"#F4D150","bgColor":"#506AF4"},"position":{"x":0,"y":0}}',
        token:
          '{"access_token":"eyJhbGciOiJIUzI1NiIsImtpZCI6Inkrd2pWVjIwa3pmZGtpZmYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3pkdnV4a2xocnRhc3FnZGt3ZXJlLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIyMThhYmI2Zi05NGEwLTQxODItYmYzOC0zMjZmMWJkMjFmYjciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2Nzc2MTQ4LCJpYXQiOjE3NTY3NzI1NDgsImVtYWlsIjoiIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnt9LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhckNvbmZpZyI6eyJiZ0NvbG9yIjoiIzUwNkFGNCIsImVhclNpemUiOiJzbWFsbCIsImV5ZUJyb3dTdHlsZSI6InVwIiwiZXllU3R5bGUiOiJjaXJjbGUiLCJmYWNlQ29sb3IiOiIjRjlDOUI2IiwiZ2xhc3Nlc1N0eWxlIjoibm9uZSIsImhhaXJDb2xvciI6IiMwMDAiLCJoYWlyU3R5bGUiOiJub3JtYWwiLCJoYXRDb2xvciI6IiNGQzkwOUYiLCJoYXRTdHlsZSI6Im5vbmUiLCJtb3V0aFN0eWxlIjoic21pbGUiLCJub3NlU3R5bGUiOiJsb25nIiwic2V4IjoibWFuIiwic2hpcnRDb2xvciI6IiNGNEQxNTAiLCJzaGlydFN0eWxlIjoicG9sbyJ9LCJuYW1lIjoiVGVzdCBVc2VyIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoiYW5vbnltb3VzIiwidGltZXN0YW1wIjoxNzU2NzcyNTQ4fV0sInNlc3Npb25faWQiOiJmNjRmNWY0ZC1hNWJhLTRjYmMtODdhNS05MWJiODg1YjE3ZTAiLCJpc19hbm9ueW1vdXMiOnRydWV9.7-Xh-aUEt4WAe8GEBYQxW-PjNKgkRY1_-K-z3mkwyEI","token_type":"bearer","expires_in":3600,"expires_at":1756776148,"refresh_token":"q6ml4yaxxixr","user":{"id":"218abb6f-94a0-4182-bf38-326f1bd21fb7","aud":"authenticated","role":"authenticated","email":"","phone":"","last_sign_in_at":"2025-09-02T00:22:27.9975967Z","app_metadata":{},"user_metadata":{"avatarConfig":{"bgColor":"#506AF4","earSize":"small","eyeBrowStyle":"up","eyeStyle":"circle","faceColor":"#F9C9B6","glassesStyle":"none","hairColor":"#000","hairStyle":"normal","hatColor":"#FC909F","hatStyle":"none","mouthStyle":"smile","noseStyle":"long","sex":"man","shirtColor":"#F4D150","shirtStyle":"polo"},"name":"Test User"},"identities":[],"created_at":"2025-09-02T00:22:27.971049Z","updated_at":"2025-09-02T00:22:28.034187Z","is_anonymous":true}}'
      },
      {
        profile:
          '{"id":"ac4bc70e-0faa-4102-9c0c-26a962c4b345","name":"Test User 2","avatarConfig":{"sex":"man","faceColor":"#F9C9B6","earSize":"big","eyeStyle":"smile","noseStyle":"round","mouthStyle":"peace","shirtStyle":"polo","glassesStyle":"round","hairColor":"#000","hairStyle":"normal","hatStyle":"none","hatColor":"#77311D","eyeBrowStyle":"up","shirtColor":"#FC909F","bgColor":"#F48150"},"position":{"x":0,"y":0}}',
        token:
          '{"access_token":"eyJhbGciOiJIUzI1NiIsImtpZCI6Inkrd2pWVjIwa3pmZGtpZmYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3pkdnV4a2xocnRhc3FnZGt3ZXJlLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJhYzRiYzcwZS0wZmFhLTQxMDItOWMwYy0yNmE5NjJjNGIzNDUiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU2Nzc0Njk5LCJpYXQiOjE3NTY3NzEwOTksImVtYWlsIjoiIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnt9LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhckNvbmZpZyI6eyJiZ0NvbG9yIjoiI0Y0ODE1MCIsImVhclNpemUiOiJiaWciLCJleWVCcm93U3R5bGUiOiJ1cCIsImV5ZVN0eWxlIjoic21pbGUiLCJmYWNlQ29sb3IiOiIjRjlDOUI2IiwiZ2xhc3Nlc1N0eWxlIjoicm91bmQiLCJoYWlyQ29sb3IiOiIjMDAwIiwiaGFpclN0eWxlIjoibm9ybWFsIiwiaGF0Q29sb3IiOiIjNzczMTFEIiwiaGF0U3R5bGUiOiJub25lIiwibW91dGhTdHlsZSI6InBlYWNlIiwibm9zZVN0eWxlIjoicm91bmQiLCJzZXgiOiJtYW4iLCJzaGlydENvbG9yIjoiI0ZDOTA5RiIsInNoaXJ0U3R5bGUiOiJwb2xvIn0sIm5hbWUiOiJUZXN0IFVzZXIgMiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6ImFub255bW91cyIsInRpbWVzdGFtcCI6MTc1Njc3MTA5OX1dLCJzZXNzaW9uX2lkIjoiMzI1MjFlZDUtNzQzOC00NDViLWEyMjAtNmM0NjI0YzIwNGZlIiwiaXNfYW5vbnltb3VzIjp0cnVlfQ.QsdddCLEXo7Xz-sBi_XX0qfVKU-ZlWRVT24V5KqdJ0w","token_type":"bearer","expires_in":3600,"expires_at":1756774699,"refresh_token":"f3isi26ptzbx","user":{"id":"ac4bc70e-0faa-4102-9c0c-26a962c4b345","aud":"authenticated","role":"authenticated","email":"","phone":"","last_sign_in_at":"2025-09-01T23:58:19.185911048Z","app_metadata":{},"user_metadata":{"avatarConfig":{"bgColor":"#F48150","earSize":"big","eyeBrowStyle":"up","eyeStyle":"smile","faceColor":"#F9C9B6","glassesStyle":"round","hairColor":"#000","hairStyle":"normal","hatColor":"#77311D","hatStyle":"none","mouthStyle":"peace","noseStyle":"round","sex":"man","shirtColor":"#FC909F","shirtStyle":"polo"},"name":"Test User 2"},"identities":[],"created_at":"2025-09-01T23:58:19.142701Z","updated_at":"2025-09-01T23:58:19.223824Z","is_anonymous":true}}'
      }
    ]

    localStorage.setItem('profile', accounts[account].profile)
    localStorage.setItem('sb-zdvuxklhrtasqgdkwere-auth-token', accounts[account].token)
  }, account)
}
