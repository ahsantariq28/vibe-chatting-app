import { test, expect } from "@playwright/test";
import { clearDatabase, disconnectDatabase } from "./helpers/db";

test.beforeEach(async () => {
  await clearDatabase();
});

test.afterAll(async () => {
  await disconnectDatabase();
});

test.describe("User Authentication", () => {
  test("should register a new user successfully", async ({ page }) => {
    await page.goto("/register");
    await page.fill('input[type="text"]', "Test User");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should redirect to login page after successful registration
    await expect(page).toHaveURL("/login", { timeout: 15000 });
  });

  test("should login successfully and redirect to chat", async ({ page }) => {
    // Register the user first
    await page.goto("/register");
    await page.fill('input[type="text"]', "Test User");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/login", { timeout: 15000 });

    // Login with credentials
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Should redirect to chat landing page (or active conversation)
    await expect(page).toHaveURL(/\/chat/, { timeout: 20000 });
  });

  test("should fail login with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Should stay on login page
    await expect(page).toHaveURL("/login", { timeout: 15000 });
  });

  test("should protect chat routes and redirect to login", async ({ page }) => {
    await page.goto("/chat");
    await expect(page).toHaveURL("/login", { timeout: 15000 });
  });
});
