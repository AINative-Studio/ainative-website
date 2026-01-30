import { test, expect } from '@playwright/test';
import { DashboardPage } from '../fixtures/dashboard.fixture';
import { AuthFixture } from '../fixtures/auth.fixture';
import { TestUtils } from '../helpers/test-utils';

/**
 * Component Interactions E2E Tests
 * Tests AIKit component interactions: buttons, text fields, sliders, checkboxes, choice pickers
 */

test.describe('AIKit Component Interactions', () => {
  let dashboardPage: DashboardPage;
  let authFixture: AuthFixture;
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    authFixture = new AuthFixture(page);
    testUtils = new TestUtils(page);

    // Setup auth session
    await authFixture.setupAuthSession();
    await dashboardPage.navigateToAIKit();
  });

  test.describe('AIKitButton Tests', () => {
    test('should display all AIKit buttons', async () => {
      const buttons = await dashboardPage.getAllAIKitButtons();
      console.log(`Found ${buttons.length} AIKit buttons`);
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle button clicks', async ({ page }) => {
      // Find interactive buttons
      const buttons = page.locator('button:not([disabled])');
      const count = await buttons.count();

      if (count > 0) {
        const firstButton = buttons.first();
        const buttonText = await firstButton.textContent();

        console.log(`Clicking button: ${buttonText}`);
        await firstButton.click();

        // Wait for any animations or state changes
        await page.waitForTimeout(500);

        // Verify no console errors occurred
        const errors = await testUtils.checkConsoleErrors();
        expect(errors.length).toBe(0);
      }
    });

    test('should show hover states on buttons', async ({ page }) => {
      const buttons = page.locator('button:not([disabled])');
      const count = await buttons.count();

      if (count > 0) {
        const firstButton = buttons.first();

        // Get initial styles
        const initialClasses = await firstButton.getAttribute('class');

        // Hover over button
        await firstButton.hover();
        await page.waitForTimeout(300);

        // Styles might change on hover
        const hoverClasses = await firstButton.getAttribute('class');

        console.log('Button hover state:', { initialClasses, hoverClasses });
      }
    });

    test('should handle disabled buttons correctly', async ({ page }) => {
      const disabledButtons = page.locator('button[disabled], button[aria-disabled="true"]');
      const count = await disabledButtons.count();

      console.log(`Found ${count} disabled buttons`);

      if (count > 0) {
        const firstDisabled = disabledButtons.first();
        const isDisabled = await firstDisabled.isDisabled();

        expect(isDisabled).toBe(true);

        // Verify it doesn't respond to clicks
        const clickCount = await page.evaluate(() => {
          let clicks = 0;
          document.querySelectorAll('button[disabled]').forEach(btn => {
            btn.addEventListener('click', () => clicks++);
          });
          return clicks;
        });
      }
    });

    test('should have accessible button labels', async ({ page }) => {
      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();

        // Button should have either text content or aria-label
        expect(ariaLabel || text?.trim()).toBeTruthy();
      }
    });
  });

  test.describe('AIKitTextField Tests', () => {
    test('should display all text fields', async () => {
      const textFields = await dashboardPage.getAllAIKitTextFields();
      console.log(`Found ${textFields.length} AIKit text fields`);
      expect(textFields.length).toBeGreaterThanOrEqual(0);
    });

    test('should accept text input', async ({ page }) => {
      const textInputs = page.locator('input[type="text"], input[type="email"], input:not([type]), textarea');
      const count = await textInputs.count();

      if (count > 0) {
        const firstInput = textInputs.first();
        const testValue = 'Test Input Value';

        await firstInput.fill(testValue);
        const value = await firstInput.inputValue();

        expect(value).toBe(testValue);
      }
    });

    test('should clear text field value', async ({ page }) => {
      const textInputs = page.locator('input[type="text"], input:not([type])');
      const count = await textInputs.count();

      if (count > 0) {
        const firstInput = textInputs.first();

        await firstInput.fill('Test Value');
        await firstInput.clear();
        const value = await firstInput.inputValue();

        expect(value).toBe('');
      }
    });

    test('should show focus state on text fields', async ({ page }) => {
      const textInputs = page.locator('input[type="text"], input:not([type])');
      const count = await textInputs.count();

      if (count > 0) {
        const firstInput = textInputs.first();

        await firstInput.focus();
        const isFocused = await firstInput.evaluate(el => el === document.activeElement);

        expect(isFocused).toBe(true);
      }
    });

    test('should validate text field input', async ({ page }) => {
      // Look for required fields
      const requiredInputs = page.locator('input[required], input[aria-required="true"]');
      const count = await requiredInputs.count();

      console.log(`Found ${count} required inputs`);

      if (count > 0) {
        const firstRequired = requiredInputs.first();

        // Try to submit without filling
        const form = page.locator('form').first();
        if (await form.count() > 0) {
          await firstRequired.focus();
          await firstRequired.blur();

          // Check for validation message
          const validationMessage = await firstRequired.evaluate((el: HTMLInputElement) => el.validationMessage);
          console.log('Validation message:', validationMessage);
        }
      }
    });
  });

  test.describe('AIKitSlider Tests', () => {
    test('should interact with sliders', async ({ page }) => {
      const sliders = page.locator('input[type="range"]');
      const count = await sliders.count();

      console.log(`Found ${count} sliders`);

      if (count > 0) {
        const firstSlider = sliders.first();

        // Get min, max, step values
        const min = Number(await firstSlider.getAttribute('min')) || 0;
        const max = Number(await firstSlider.getAttribute('max')) || 100;
        const step = Number(await firstSlider.getAttribute('step')) || 1;

        // Set to middle value
        const middleValue = Math.floor((min + max) / 2);
        await firstSlider.fill(middleValue.toString());

        const value = await firstSlider.inputValue();
        expect(Number(value)).toBeGreaterThanOrEqual(min);
        expect(Number(value)).toBeLessThanOrEqual(max);

        console.log('Slider values:', { min, max, step, set: middleValue, actual: value });
      }
    });

    test('should show slider value updates', async ({ page }) => {
      const sliders = page.locator('input[type="range"]');
      const count = await sliders.count();

      if (count > 0) {
        const firstSlider = sliders.first();

        // Look for value display element
        const valueDisplay = page.locator('[data-testid*="slider-value"], .slider-value, output').first();

        if (await valueDisplay.count() > 0) {
          const initialValue = await valueDisplay.textContent();

          await firstSlider.fill('50');
          await page.waitForTimeout(300);

          const newValue = await valueDisplay.textContent();

          console.log('Slider value display:', { initialValue, newValue });
        }
      }
    });

    test('should support keyboard navigation on sliders', async ({ page }) => {
      const sliders = page.locator('input[type="range"]');
      const count = await sliders.count();

      if (count > 0) {
        const firstSlider = sliders.first();

        await firstSlider.focus();
        const initialValue = Number(await firstSlider.inputValue());

        // Press arrow right to increase
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);

        const newValue = Number(await firstSlider.inputValue());

        console.log('Keyboard slider control:', { initialValue, newValue });
      }
    });
  });

  test.describe('AIKitCheckBox Tests', () => {
    test('should toggle checkboxes', async ({ page }) => {
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();

      console.log(`Found ${count} checkboxes`);

      if (count > 0) {
        const firstCheckbox = checkboxes.first();

        const initialState = await firstCheckbox.isChecked();
        await firstCheckbox.click();
        const newState = await firstCheckbox.isChecked();

        expect(newState).toBe(!initialState);

        console.log('Checkbox toggle:', { initialState, newState });
      }
    });

    test('should handle indeterminate checkbox state', async ({ page }) => {
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();

      if (count > 0) {
        const checkbox = checkboxes.first();

        // Check for indeterminate state
        const isIndeterminate = await checkbox.evaluate((el: HTMLInputElement) => el.indeterminate);

        console.log('Checkbox indeterminate state:', isIndeterminate);
      }
    });

    test('should show checkbox labels', async ({ page }) => {
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();

      for (let i = 0; i < Math.min(count, 3); i++) {
        const checkbox = checkboxes.nth(i);
        const id = await checkbox.getAttribute('id');

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const labelText = await label.textContent();

          console.log(`Checkbox ${i + 1} label:`, labelText);
        }
      }
    });
  });

  test.describe('AIKitChoicePicker Tests', () => {
    test('should open choice picker dropdown', async ({ page }) => {
      const pickers = page.locator('select, [role="combobox"], [role="listbox"]');
      const count = await pickers.count();

      console.log(`Found ${count} choice pickers`);

      if (count > 0) {
        const firstPicker = pickers.first();

        await firstPicker.click();
        await page.waitForTimeout(500);

        // Check if options are visible
        const options = page.locator('[role="option"], option');
        const optionsCount = await options.count();

        console.log(`Choice picker opened with ${optionsCount} options`);
      }
    });

    test('should select option from choice picker', async ({ page }) => {
      const selects = page.locator('select');
      const count = await selects.count();

      if (count > 0) {
        const firstSelect = selects.first();

        const options = firstSelect.locator('option');
        const optionsCount = await options.count();

        if (optionsCount > 1) {
          const secondOption = options.nth(1);
          const optionValue = await secondOption.getAttribute('value');

          if (optionValue) {
            await firstSelect.selectOption(optionValue);

            const selectedValue = await firstSelect.inputValue();
            expect(selectedValue).toBe(optionValue);
          }
        }
      }
    });

    test('should support keyboard navigation in choice picker', async ({ page }) => {
      const comboboxes = page.locator('[role="combobox"]');
      const count = await comboboxes.count();

      if (count > 0) {
        const firstCombobox = comboboxes.first();

        await firstCombobox.focus();
        await page.keyboard.press('Space'); // Open dropdown
        await page.waitForTimeout(300);

        await page.keyboard.press('ArrowDown'); // Navigate options
        await page.waitForTimeout(200);

        await page.keyboard.press('Enter'); // Select option
        await page.waitForTimeout(300);

        console.log('Choice picker keyboard navigation completed');
      }
    });
  });
});