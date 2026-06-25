# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> User Authentication >> should login successfully and redirect to chat
- Location: tests\auth.spec.ts:24:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/chat/
Received string:  "http://localhost:3001/login"
Timeout: 20000ms

Call log:
  - Expect "toHaveURL" with timeout 20000ms
    43 × unexpected value "http://localhost:3001/login"

```

```yaml
- alert
- heading "Login to Vibe Chat" [level=1]
- text: Email
- textbox: test@example.com
- text: Password
- textbox: password123
- button "Login"
- paragraph:
  - text: Don't have an account?
  - link "Register":
    - /url: /register
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { clearDatabase, disconnectDatabase } from "./helpers/db";
  3  | 
  4  | test.beforeEach(async () => {
  5  |   await clearDatabase();
  6  | });
  7  | 
  8  | test.afterAll(async () => {
  9  |   await disconnectDatabase();
  10 | });
  11 | 
  12 | test.describe("User Authentication", () => {
  13 |   test("should register a new user successfully", async ({ page }) => {
  14 |     await page.goto("/register");
  15 |     await page.fill('input[type="text"]', "Test User");
  16 |     await page.fill('input[type="email"]', "test@example.com");
  17 |     await page.fill('input[type="password"]', "password123");
  18 |     await page.click('button[type="submit"]');
  19 | 
  20 |     // Should redirect to login page after successful registration
  21 |     await expect(page).toHaveURL("/login", { timeout: 15000 });
  22 |   });
  23 | 
  24 |   test("should login successfully and redirect to chat", async ({ page }) => {
  25 |     // Register the user first
  26 |     await page.goto("/register");
  27 |     await page.fill('input[type="text"]', "Test User");
  28 |     await page.fill('input[type="email"]', "test@example.com");
  29 |     await page.fill('input[type="password"]', "password123");
  30 |     await page.click('button[type="submit"]');
  31 |     await expect(page).toHaveURL("/login", { timeout: 15000 });
  32 | 
  33 |     // Login with credentials
  34 |     await page.fill('input[type="email"]', "test@example.com");
  35 |     await page.fill('input[type="password"]', "password123");
  36 |     await page.click('button[type="submit"]');
  37 | 
  38 |     // Should redirect to chat landing page (or active conversation)
> 39 |     await expect(page).toHaveURL(/\/chat/, { timeout: 20000 });
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  40 |   });
  41 | 
  42 |   test("should fail login with invalid credentials", async ({ page }) => {
  43 |     await page.goto("/login");
  44 |     await page.fill('input[type="email"]', "wrong@example.com");
  45 |     await page.fill('input[type="password"]', "wrongpassword");
  46 |     await page.click('button[type="submit"]');
  47 | 
  48 |     // Should stay on login page
  49 |     await expect(page).toHaveURL("/login", { timeout: 15000 });
  50 |   });
  51 | 
  52 |   test("should protect chat routes and redirect to login", async ({ page }) => {
  53 |     await page.goto("/chat");
  54 |     await expect(page).toHaveURL("/login", { timeout: 15000 });
  55 |   });
  56 | });
  57 | 
```