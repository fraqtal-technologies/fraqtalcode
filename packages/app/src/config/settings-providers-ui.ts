/** IDs allowed in Settings → Providers (and its “View all” list). Does not affect APIs, models, or other dialogs. */
export const SETTINGS_PROVIDERS_UI_IDS = new Set(["anthropic", "openai", "google"])

export function isSettingsProvidersUiId(id: string): boolean {
  return SETTINGS_PROVIDERS_UI_IDS.has(id)
}
