import { test, expect } from "../fixtures"
import { closeDialog, openSettings } from "../actions"

test("settings providers lists only allowlisted providers and no custom row", async ({ page, gotoSession }) => {
  await gotoSession()

  const settings = await openSettings(page)
  await settings.getByRole("tab", { name: "Providers" }).click()

  await expect(settings.locator('[data-component="custom-provider-section"]')).toHaveCount(0)

  const providersRoot = settings.locator('[data-component="settings-providers-root"]')
  const connectButtons = providersRoot.getByRole("button", { name: "Connect" })
  await expect(connectButtons).toHaveCount(3)
})

test("settings providers view-all dialog lists only allowlisted providers", async ({ page, gotoSession }) => {
  await gotoSession()

  const settings = await openSettings(page)
  await settings.getByRole("tab", { name: "Providers" }).click()

  await settings.locator('[data-action="settings-providers-show-more"]').click()

  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible()

  const listItems = dialog.locator('[data-slot="list-item"]')
  await expect(listItems).toHaveCount(3)

  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)

  await closeDialog(page, settings)
})
