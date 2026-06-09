import { test, expect } from "@playwright/test";
import { login } from "./helpers";

/**
 * Smoke tests for the /settings page.
 *
 * These tests verify that each of the 9 settings tabs renders its
 * expected UI elements. They do NOT depend on LLM responses or
 * WebSocket connections — only on the settings API returning a profile.
 */

const TIMEOUT = 10_000;

/** Navigate to /settings after login. */
async function goToSettings(page: import("@playwright/test").Page) {
  await login(page);
  await page.goto("/settings", { waitUntil: "networkidle" });
  // Wait for the loading spinner to disappear (profile fetch)
  await expect(page.locator(".animate-spin")).toBeHidden({ timeout: TIMEOUT });
}

/** Click a sidebar tab button by its visible label. */
async function clickTab(page: import("@playwright/test").Page, label: string) {
  const tab = page.locator("aside button", { hasText: label }).first();
  await tab.click();
  // Small settle time for tab content to render
  await page.waitForTimeout(500);
}

// ── Tests ───────────────────────────────────────────────────────

test.describe("Settings page — tab smoke tests", () => {
  test("all 9 tab buttons are visible", async ({ page }) => {
    await goToSettings(page);

    const expectedTabs = [
      "Profile",
      "LLM",
      "Skills",
      "Channels",
      "Sandbox",
      "Tools",
      "Users",
      "System",
      "Server",
    ];

    for (const label of expectedTabs) {
      await expect(
        page.locator("aside button", { hasText: label }).first(),
      ).toBeVisible({ timeout: TIMEOUT });
    }
  });

  test("Profile tab renders profile info and gateway status", async ({
    page,
  }) => {
    await goToSettings(page);
    await clickTab(page, "Profile");

    // "Profile Information" heading
    await expect(
      page.locator("h3", { hasText: "Profile Information" }),
    ).toBeVisible({ timeout: TIMEOUT });

    // "Display Name" label
    await expect(
      page.locator("text=Display Name").first(),
    ).toBeVisible({ timeout: TIMEOUT });

    // "Gateway Status" section
    await expect(
      page.locator("h3", { hasText: "Gateway Status" }),
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test("LLM tab renders provider selector and fallback section", async ({
    page,
  }) => {
    await goToSettings(page);
    await clickTab(page, "LLM");

    // Wait for the LLM tab content to fully render (profile-dependent)
    const llmHeading = page.getByRole("heading", { name: "LLM Configuration" });
    await llmHeading.waitFor({ state: "visible", timeout: TIMEOUT });

    // "LLM Configuration" heading
    await expect(llmHeading).toBeVisible();

    // Provider dropdown (select element with "Select a provider..." option)
    await expect(
      page.locator("select").filter({ hasText: "Select a provider..." }).first(),
    ).toBeVisible({ timeout: TIMEOUT });

    // "Fallback Models" heading
    await expect(
      page.getByRole("heading", { name: "Fallback Models" }),
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test("Skills tab shows Installed Skills and Octos Hub", async ({
    page,
  }) => {
    await goToSettings(page);
    await clickTab(page, "Skills");

    await expect(
      page.locator("h3", { hasText: "Installed Skills" }),
    ).toBeVisible({ timeout: TIMEOUT });

    await expect(
      page.locator("h3", { hasText: "Octos Hub" }),
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test("Channels tab renders Add Channel button", async ({ page }) => {
    await goToSettings(page);
    await clickTab(page, "Channels");

    await expect(
      page.locator("button", { hasText: "Add Channel" }).first(),
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test("Sandbox tab renders configuration section", async ({ page }) => {
    await goToSettings(page);
    await clickTab(page, "Sandbox");

    // "Sandbox Configuration" heading
    await expect(
      page.locator("h3", { hasText: "Sandbox Configuration" }),
    ).toBeVisible({ timeout: TIMEOUT });

    // "Enable Sandbox" label
    await expect(
      page.locator("text=Enable Sandbox").first(),
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test("Tools tab renders Web Search APIs section", async ({ page }) => {
    await goToSettings(page);
    await clickTab(page, "Tools");

    await expect(
      page.locator("h3", { hasText: "Web Search APIs" }),
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test("System tab shows Operator Overview (admin)", async ({ page }) => {
    await goToSettings(page);
    await clickTab(page, "System");

    await expect(
      page.locator("h3", { hasText: "Operator Overview" }),
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test("Server tab shows Deployment Mode (admin)", async ({ page }) => {
    await goToSettings(page);
    await clickTab(page, "Server");

    // "Server Info" heading
    await expect(
      page.locator("h3", { hasText: "Server Info" }),
    ).toBeVisible({ timeout: TIMEOUT });

    // "Deployment Mode" heading
    await expect(
      page.locator("h3", { hasText: "Deployment Mode" }),
    ).toBeVisible({ timeout: TIMEOUT });
  });

  test("tab switching changes content", async ({ page }) => {
    await goToSettings(page);

    // Start on Profile tab — verify its heading is shown
    await clickTab(page, "Profile");
    await expect(
      page.locator("h3", { hasText: "Profile Information" }),
    ).toBeVisible({ timeout: TIMEOUT });

    // Switch to LLM — Profile heading should disappear, LLM heading should appear
    await clickTab(page, "LLM");
    await expect(
      page.locator("h3", { hasText: "Profile Information" }),
    ).toBeHidden({ timeout: TIMEOUT });
    const llmHeading = page.getByRole("heading", { name: "LLM Configuration" });
    await llmHeading.waitFor({ state: "visible", timeout: TIMEOUT });
    await expect(llmHeading).toBeVisible();

    // Switch to Skills — LLM heading should disappear, Skills heading should appear
    await clickTab(page, "Skills");
    await expect(
      page.getByRole("heading", { name: "LLM Configuration" }),
    ).toBeHidden({ timeout: TIMEOUT });
    await expect(
      page.locator("h3", { hasText: "Installed Skills" }),
    ).toBeVisible({ timeout: TIMEOUT });
  });
});
