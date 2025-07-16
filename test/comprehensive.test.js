const { test, expect } = require('@playwright/test');

// Comprehensive E2E and security tests for production readiness

test.describe('Advanced Ad Management Platform - E2E Tests', () => {
  test('complete campaign creation workflow', async ({ page }) => {
    await page.goto('/admin');
    await page.click('[data-testid="create-campaign"]');
    await page.fill('[data-testid="campaign-name"]', 'E2E Test Campaign');
    await page.selectOption('[data-testid="ad-format"]', 'pushdown');
    await page.fill('[data-testid="campaign-description"]', 'Test campaign for E2E validation');
    await page.click('[data-testid="targeting-tab"]');
    await page.fill('[data-testid="geographic-targeting"]', 'US,CA,UK');
    await page.selectOption('[data-testid="device-targeting"]', 'desktop');
    await page.setInputFiles('[data-testid="creative-upload"]', 'test/fixtures/test-banner.jpg');
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
    await page.click('[data-testid="preview-campaign"]');
    await expect(page.locator('[data-testid="preview-container"]')).toBeVisible();
    await page.click('[data-testid="publish-campaign"]');
    await expect(page.locator('.success-message')).toContainText('Campaign published successfully');
    await page.goto('/admin#campaigns');
    await expect(page.locator('[data-campaign-name="E2E Test Campaign"]')).toBeVisible();
  });

  test('tag generation and integration', async ({ page }) => {
    await page.goto('/admin#tag-generator');
    await page.selectOption('[name="format"]', 'interscroller');
    await page.selectOption('[name="size"]', '970x250');
    await page.selectOption('[name="placement"]', 'content');
    await page.fill('[name="geo"]', 'US,CA');
    await page.click('button[type="submit"]');
    await expect(page.locator('#generated-tag')).toBeVisible();
    const tagCode = await page.locator('#tag-code').inputValue();
    expect(tagCode).toContain('data-format="interscroller"');
    expect(tagCode).toContain('data-size="970x250"');
    await page.click('button:has-text("Copy to Clipboard")');
    await expect(page.locator('.alert-success')).toBeVisible();
  });

  test('real-time analytics dashboard', async ({ page }) => {
    await page.goto('/admin#analytics');
    await expect(page.locator('#total-revenue')).toBeVisible();
    await expect(page.locator('#avg-cpm')).toBeVisible();
    await expect(page.locator('#fill-rate')).toBeVisible();
    await expect(page.locator('#revenue-chart')).toBeVisible();
    await expect(page.locator('#format-chart')).toBeVisible();
    await page.click('button:has-text("Refresh Insights")');
    await expect(page.locator('#insights-container')).not.toBeEmpty();
  });

  test('A/B testing workflow', async ({ page }) => {
    await page.goto('/admin#analytics');
    await page.click('button:has-text("Create New Test")');
    await page.evaluate(() => { window.prompt = () => 'Banner vs PushDown Test'; });
    await page.click('button:has-text("Create New Test")');
    await expect(page.locator('#ab-tests-table')).toContainText('Banner vs PushDown Test');
  });

  test('ad format rendering', async ({ page }) => {
    const formats = ['banner', 'pushdown', 'interscroller', 'popup', 'inpage'];
    for (const format of formats) {
      await page.goto(`/test-ad?format=${format}&size=728x90`);
      await expect(page.locator('.lite-ad-container')).toBeVisible();
      if (format === 'pushdown') {
        await page.hover('.lite-ad-pushdown');
        await expect(page.locator('.lite-ad-pushdown')).toHaveCSS('height', '270px');
      }
    }
  });

  test('mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');
    await expect(page.locator('.dashboard-layout')).toHaveCSS('grid-template-columns', '1fr');
    await page.goto('/test-ad?format=banner&size=320x50');
    await expect(page.locator('.lite-ad-banner')).toBeVisible();
  });

  test('performance metrics', async ({ page }) => {
    const response = await page.goto('/admin');
    expect(response.status()).toBe(200);
    const loadTime = await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart);
    expect(loadTime).toBeLessThan(3000);
    const adStartTime = Date.now();
    await page.goto('/ad?format=banner&slot=test&size=728x90');
    const adLoadTime = Date.now() - adStartTime;
    expect(adLoadTime).toBeLessThan(200);
  });
});

test.describe('Security Tests', () => {
  test('XSS prevention', async ({ page }) => {
    const maliciousScript = '<script>alert("XSS")</script>';
    await page.goto('/admin');
    await page.click('[data-testid="create-campaign"]');
    await page.fill('[data-testid="campaign-name"]', maliciousScript);
    await page.click('[data-testid="next-step"]');
    const campaignName = await page.locator('[data-testid="campaign-name"]').inputValue();
    expect(campaignName).not.toContain('<script>');
  });

  test('SQL injection protection', async ({ page }) => {
    const sqlInjection = "'; DROP TABLE campaigns; --";
    const response = await page.request.get(`/ad?slot=${encodeURIComponent(sqlInjection)}`);
    expect(response.status()).toBe(400);
  });

  test('rate limiting', async ({ page }) => {
    const requests = [];
    for (let i = 0; i < 150; i++) {
      requests.push(page.request.get('/ad?format=banner&slot=test'));
    }
    const responses = await Promise.all(requests);
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
