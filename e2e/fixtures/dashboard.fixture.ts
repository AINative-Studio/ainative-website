import { Page, Locator } from '@playwright/test';
import { BasePage, TestUtils } from '../helpers/test-utils';

/**
 * Dashboard Page Object Model
 * Provides methods to interact with dashboard components
 */

export type DashboardTab = 'overview' | 'ai-kit' | 'usage' | 'billing' | 'settings';

export class DashboardPage extends BasePage {
  // Tab selectors
  private readonly tabSelectors = {
    overview: '[data-testid="tab-overview"], [role="tab"]:has-text("Overview")',
    'ai-kit': '[data-testid="tab-ai-kit"], [role="tab"]:has-text("AI Kit")',
    usage: '[data-testid="tab-usage"], [role="tab"]:has-text("Usage")',
    billing: '[data-testid="tab-billing"], [role="tab"]:has-text("Billing")',
    settings: '[data-testid="tab-settings"], [role="tab"]:has-text("Settings")',
  };

  // Component selectors
  private readonly componentSelectors = {
    button: '[data-testid*="aikit-button"], button.aikit-button',
    textField: '[data-testid*="aikit-textfield"], input.aikit-textfield',
    slider: '[data-testid*="aikit-slider"], input[type="range"].aikit-slider',
    checkbox: '[data-testid*="aikit-checkbox"], input[type="checkbox"].aikit-checkbox',
    choicePicker: '[data-testid*="aikit-choice-picker"], .aikit-choice-picker',
  };

  constructor(page: Page) {
    super(page, new TestUtils(page));
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard() {
    await this.navigate('/dashboard');
  }

  /**
   * Navigate to AI Kit page
   */
  async navigateToAIKit() {
    await this.navigate('/ai-kit');
  }

  /**
   * Switch to a specific tab
   */
  async switchTab(tab: DashboardTab) {
    const tabSelector = this.tabSelectors[tab];
    const tabElement = this.page.locator(tabSelector).first();
    await tabElement.click();

    // Wait for tab content to load
    await this.page.waitForTimeout(500);

    // Verify tab is selected
    const isSelected = await tabElement.getAttribute('aria-selected');
    return isSelected === 'true';
  }

  /**
   * Get all available tabs
   */
  async getTabs(): Promise<string[]> {
    const tabs = this.page.locator('[role="tab"]');
    const count = await tabs.count();
    const tabNames: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await tabs.nth(i).textContent();
      if (text) {
        tabNames.push(text.trim());
      }
    }

    return tabNames;
  }

  /**
   * Get current active tab
   */
  async getActiveTab(): Promise<string | null> {
    const activeTab = this.page.locator('[role="tab"][aria-selected="true"]');
    return await activeTab.textContent();
  }

  /**
   * Click AIKit button
   */
  async clickAIKitButton(buttonText: string) {
    const button = this.page.locator(`${this.componentSelectors.button}:has-text("${buttonText}")`).first();
    await button.click();
    return button;
  }

  /**
   * Fill AIKit text field
   */
  async fillAIKitTextField(label: string, value: string) {
    const textField = this.page.locator(`${this.componentSelectors.textField}[aria-label*="${label}"], ${this.componentSelectors.textField}[placeholder*="${label}"]`).first();
    await textField.fill(value);
    return textField;
  }

  /**
   * Interact with AIKit slider
   */
  async setAIKitSliderValue(label: string, value: number) {
    const slider = this.page.locator(`${this.componentSelectors.slider}[aria-label*="${label}"]`).first();
    await slider.fill(value.toString());

    // Verify value was set
    const currentValue = await slider.inputValue();
    return { slider, value: currentValue };
  }

  /**
   * Toggle AIKit checkbox
   */
  async toggleAIKitCheckbox(label: string) {
    const checkbox = this.page.locator(`${this.componentSelectors.checkbox}[aria-label*="${label}"]`).first();
    const isChecked = await checkbox.isChecked();
    await checkbox.click();

    // Verify state changed
    const newState = await checkbox.isChecked();
    return { checkbox, wasChecked: isChecked, isChecked: newState };
  }

  /**
   * Select from AIKit choice picker
   */
  async selectAIKitChoice(pickerLabel: string, choiceText: string) {
    const picker = this.page.locator(`${this.componentSelectors.choicePicker}[aria-label*="${pickerLabel}"]`).first();
    await picker.click();

    // Wait for options to appear
    await this.page.waitForTimeout(300);

    // Select the choice
    const option = this.page.locator(`[role="option"]:has-text("${choiceText}"), .choice-option:has-text("${choiceText}")`).first();
    await option.click();

    return { picker, selectedChoice: choiceText };
  }

  /**
   * Get all AIKit buttons on current page
   */
  async getAllAIKitButtons(): Promise<Locator[]> {
    const buttons = this.page.locator(this.componentSelectors.button);
    const count = await buttons.count();
    const buttonList: Locator[] = [];

    for (let i = 0; i < count; i++) {
      buttonList.push(buttons.nth(i));
    }

    return buttonList;
  }

  /**
   * Get all AIKit text fields on current page
   */
  async getAllAIKitTextFields(): Promise<Locator[]> {
    const textFields = this.page.locator(this.componentSelectors.textField);
    const count = await textFields.count();
    const fieldList: Locator[] = [];

    for (let i = 0; i < count; i++) {
      fieldList.push(textFields.nth(i));
    }

    return fieldList;
  }

  /**
   * Test keyboard navigation through tabs
   */
  async testTabKeyboardNavigation() {
    const tabs = this.page.locator('[role="tab"]');
    const count = await tabs.count();

    // Focus first tab
    await tabs.first().focus();

    const navigationResults = [];

    for (let i = 0; i < count; i++) {
      // Press right arrow
      await this.page.keyboard.press('ArrowRight');
      await this.page.waitForTimeout(200);

      const activeTab = await this.getActiveTab();
      navigationResults.push(activeTab);
    }

    return navigationResults;
  }

  /**
   * Verify URL updates when switching tabs
   */
  async verifyTabURLUpdate(tab: DashboardTab) {
    const initialUrl = this.page.url();
    await this.switchTab(tab);
    await this.page.waitForTimeout(500);
    const newUrl = this.page.url();

    return {
      initialUrl,
      newUrl,
      urlChanged: initialUrl !== newUrl,
      containsTabName: newUrl.toLowerCase().includes(tab.toLowerCase()),
    };
  }

  /**
   * Test browser back/forward navigation
   */
  async testBrowserNavigation() {
    const history: string[] = [];

    // Navigate through tabs
    await this.switchTab('overview');
    history.push(this.page.url());

    await this.switchTab('ai-kit');
    history.push(this.page.url());

    await this.switchTab('usage');
    history.push(this.page.url());

    // Go back
    await this.page.goBack();
    await this.page.waitForTimeout(500);
    const afterBack = this.page.url();

    // Go forward
    await this.page.goForward();
    await this.page.waitForTimeout(500);
    const afterForward = this.page.url();

    return {
      history,
      afterBack,
      afterForward,
      backWorked: afterBack === history[1],
      forwardWorked: afterForward === history[2],
    };
  }

  /**
   * Capture screenshot of specific tab
   */
  async captureTabScreenshot(tab: DashboardTab, suffix = '') {
    await this.switchTab(tab);
    await this.page.waitForTimeout(1000); // Wait for animations
    await this.utils.takeScreenshot(`dashboard-${tab}${suffix ? `-${suffix}` : ''}`, true);
  }

  /**
   * Capture screenshots of all tabs
   */
  async captureAllTabScreenshots(suffix = '') {
    const tabs: DashboardTab[] = ['overview', 'ai-kit', 'usage', 'billing', 'settings'];

    for (const tab of tabs) {
      try {
        await this.captureTabScreenshot(tab, suffix);
      } catch (error) {
        console.log(`Could not capture screenshot for tab: ${tab}`);
      }
    }
  }
}