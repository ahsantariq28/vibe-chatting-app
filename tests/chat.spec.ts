import { test, expect } from "@playwright/test";
import { clearDatabase, disconnectDatabase } from "./helpers/db";

test.beforeEach(async () => {
  await clearDatabase();
});

test.afterAll(async () => {
  await disconnectDatabase();
});

test.describe("Real-time Chat and Sockets", () => {
  test("should handle messaging, typing indicators, presence, and logs", async ({ browser }) => {
    // 1. Create two separate browser contexts to represent Alice and Bob
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();

    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    // 2. Register and login Alice (User A)
    await pageA.goto("/register");
    await pageA.fill('input[type="text"]', "Alice");
    await pageA.fill('input[type="email"]', "alice@example.com");
    await pageA.fill('input[type="password"]', "password123");
    await pageA.click('button[type="submit"]');
    await expect(pageA).toHaveURL("/login", { timeout: 15000 });

    await pageA.fill('input[type="email"]', "alice@example.com");
    await pageA.fill('input[type="password"]', "password123");
    await pageA.click('button[type="submit"]');
    await expect(pageA).toHaveURL(/\/chat/, { timeout: 20000 });

    // 3. Register and login Bob (User B)
    await pageB.goto("/register");
    await pageB.fill('input[type="text"]', "Bob");
    await pageB.fill('input[type="email"]', "bob@example.com");
    await pageB.fill('input[type="password"]', "password123");
    await pageB.click('button[type="submit"]');
    await expect(pageB).toHaveURL("/login", { timeout: 15000 });

    await pageB.fill('input[type="email"]', "bob@example.com");
    await pageB.fill('input[type="password"]', "password123");
    await pageB.click('button[type="submit"]');
    await expect(pageB).toHaveURL(/\/chat/, { timeout: 20000 });

    // 4. Alice searches for Bob to start a conversation
    await pageA.fill('input[placeholder="Search users..."]', "Bob");
    // Click on Bob in the search dropdown list
    await pageA.click('text=Bob');

    // Alice should be redirected to the conversation route
    await expect(pageA).toHaveURL(/\/chat\/[a-f0-9]+/, { timeout: 20000 });
    const conversationUrl = pageA.url();
    const match = conversationUrl.match(/\/chat\/([a-f0-9]+)/);
    const conversationId = match ? match[1] : null;
    expect(conversationId).not.toBeNull();

    // 5. Bob goes directly to the conversation page
    await pageB.goto(`/chat/${conversationId}`);

    // Wait for the websocket connections to stabilize and join room
    await pageA.waitForTimeout(2000);
    await pageB.waitForTimeout(2000);

    // 6. Verify online status
    await expect(pageA.locator('text=Online')).toBeVisible({ timeout: 10000 });
    await expect(pageB.locator('text=Online')).toBeVisible({ timeout: 10000 });

    // 7. Verify typing status
    // Alice starts typing
    await pageA.fill('input[placeholder="Type a message..."]', "Hi Bob, how are you?");
    // Bob should see "Alice is typing..."
    await expect(pageB.locator('text=Alice is typing...')).toBeVisible({ timeout: 10000 });

    // 8. Verify message transmission
    // Alice sends the message
    await pageA.click('button:has-text("Send")');
    // Bob should see Alice's message
    await expect(pageB.locator('text=Hi Bob, how are you?')).toBeVisible({ timeout: 10000 });
    // The typing indicator should disappear
    await expect(pageB.locator('text=Alice is typing...')).not.toBeVisible({ timeout: 10000 });

    // 9. Bob replies
    await pageB.fill('input[placeholder="Type a message..."]', "Hi Alice! Doing great.");
    await expect(pageA.locator('text=Bob is typing...')).toBeVisible({ timeout: 10000 });
    await pageB.click('button:has-text("Send")');
    await expect(pageA.locator('text=Hi Alice! Doing great.')).toBeVisible({ timeout: 10000 });

    // 10. Verify offline status
    // Alice logs out
    await pageA.click('button:has-text("Logout")');
    await expect(pageA).toHaveURL("/login", { timeout: 15000 });

    // Bob should now see Alice as offline
    await expect(pageB.locator('text=Offline')).toBeVisible({ timeout: 10000 });

    await contextA.close();
    await contextB.close();
  });
});
