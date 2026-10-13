import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const stabilizeCss = fileURLToPath(new URL('./stabilize.css', import.meta.url));

/**
 * Визуальные (скриншотные) тесты критичных состояний компонентов.
 * Источник страниц — Storybook (iframe.html с viewMode=story).
 * Эталоны: tests/visual/__screenshots__/visual.spec.ts/
 */
const criticalStories = [
  // Button: варианты и состояния
  'components-button--primary',
  'components-button--secondary',
  'components-button--ghost',
  'components-button--danger',
  'components-button--sizes',
  'components-button--loading',
  'components-button--loading-and-disabled',
  // Input: базовые и error/disabled
  'components-input--default',
  'components-input--with-error',
  'components-input--disabled',
  // Checkbox: состояния
  'components-checkbox--default',
  'components-checkbox--checked',
  'components-checkbox--indeterminate',
];

for (const storyId of criticalStories) {
  test(storyId, async ({ page }) => {
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);

    const root = page.locator('#storybook-root');
    await expect(root).not.toBeEmpty();
    // Дождаться рендеринга и загрузки шрифтов до снимка
    await page.evaluate(() => document.fonts.ready);

    await expect(page).toHaveScreenshot(`${storyId}.png`, {
      fullPage: true,
      stylePath: stabilizeCss,
    });
  });
}
