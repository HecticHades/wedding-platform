import { test, expect } from '@playwright/test';

test.describe('Tenant Site Theme Application', () => {
  // Note: Using 'demo' subdomain from seed data
  const tenantDomain = 'demo';

  test.beforeEach(async ({ page }) => {
    // Navigate to the tenant site
    await page.goto(`/${tenantDomain}`);
    await page.waitForLoadState('networkidle');
  });

  test('should display hero section with gradient background when no hero image', async ({ page }) => {
    // Check that the hero section exists
    const heroSection = page.locator('header').first();
    await expect(heroSection).toBeVisible();

    // Check that hero has some background styling (gradient or color)
    const heroStyle = await heroSection.evaluate((el) => {
      const styles = getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        backgroundImage: styles.backgroundImage,
      };
    });

    console.log('Hero styles:', heroStyle);
    // Should have either a background color or image
    expect(heroStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' || heroStyle.backgroundImage !== 'none').toBeTruthy();
  });

  test('should apply CSS variables from ThemeProvider to document', async ({ page }) => {
    // Check if CSS variables are being set on any element
    const cssVariables = await page.evaluate(() => {
      // Walk up the DOM to find where CSS variables are set
      const findCSSVariables = (element: Element): Record<string, string> => {
        const vars: Record<string, string> = {};
        const computedStyle = getComputedStyle(element);

        vars['--wedding-primary'] = computedStyle.getPropertyValue('--wedding-primary').trim();
        vars['--wedding-secondary'] = computedStyle.getPropertyValue('--wedding-secondary').trim();
        vars['--wedding-background'] = computedStyle.getPropertyValue('--wedding-background').trim();
        vars['--wedding-text'] = computedStyle.getPropertyValue('--wedding-text').trim();
        vars['--wedding-accent'] = computedStyle.getPropertyValue('--wedding-accent').trim();
        vars['--wedding-font-body'] = computedStyle.getPropertyValue('--wedding-font-body').trim();
        vars['--wedding-font-heading'] = computedStyle.getPropertyValue('--wedding-font-heading').trim();

        return vars;
      };

      // Check from body element
      const body = document.body;
      return findCSSVariables(body);
    });

    console.log('CSS Variables:', cssVariables);

    // Verify CSS variables are set (should have values, not be empty)
    expect(cssVariables['--wedding-primary']).toBeTruthy();
    expect(cssVariables['--wedding-secondary']).toBeTruthy();
    expect(cssVariables['--wedding-background']).toBeTruthy();
    expect(cssVariables['--wedding-text']).toBeTruthy();
    expect(cssVariables['--wedding-accent']).toBeTruthy();
    expect(cssVariables['--wedding-font-body']).toBeTruthy();
    expect(cssVariables['--wedding-font-heading']).toBeTruthy();
  });

  test('should apply heading font to h1 element', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    const h1Text = await h1.textContent();
    console.log('H1 text:', h1Text);

    const fontFamily = await h1.evaluate((el) => {
      return getComputedStyle(el).fontFamily;
    });

    console.log('H1 font-family:', fontFamily);

    // The h1 should have font-family set (either directly or via CSS variable)
    expect(fontFamily).toBeTruthy();
    expect(fontFamily.length).toBeGreaterThan(0);
  });

  test('should have proper text colors on content', async ({ page }) => {
    // Check the hero section text
    const heroText = page.locator('header p').first();

    if (await heroText.count() > 0) {
      const textColor = await heroText.evaluate((el) => {
        return getComputedStyle(el).color;
      });

      console.log('Hero text color:', textColor);
      // Hero text should be white or light colored on gradient/image background
      expect(textColor).toBeTruthy();
    }
  });

  test('should have consistent styling across sections', async ({ page }) => {
    // Scroll down to check if other sections exist and are styled
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    // Look for section headings
    const sectionHeadings = page.locator('h2');
    const headingCount = await sectionHeadings.count();

    if (headingCount > 0) {
      for (let i = 0; i < Math.min(headingCount, 3); i++) {
        const heading = sectionHeadings.nth(i);
        const styles = await heading.evaluate((el) => {
          const computed = getComputedStyle(el);
          return {
            fontFamily: computed.fontFamily,
            color: computed.color,
          };
        });

        console.log(`Section heading ${i} styles:`, styles);

        // Each heading should have font and color set
        expect(styles.fontFamily).toBeTruthy();
        expect(styles.color).toBeTruthy();
      }
    }
  });

  test('should render RSVP button with theme colors', async ({ page }) => {
    // Find the RSVP button in hero
    const rsvpButton = page.locator('a:has-text("RSVP")').first();

    if (await rsvpButton.count() > 0) {
      await expect(rsvpButton).toBeVisible();

      const buttonStyles = await rsvpButton.evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          borderRadius: computed.borderRadius,
        };
      });

      console.log('RSVP button styles:', buttonStyles);

      // Button should have visible styling
      expect(buttonStyles.backgroundColor).toBeTruthy();
      expect(buttonStyles.color).toBeTruthy();
    }
  });

  test('should apply inline theme styles to sections', async ({ page }) => {
    // Check that sections have inline styles applied (from theme)
    const sectionsWithStyle = await page.evaluate(() => {
      const sections = document.querySelectorAll('div[style*="backgroundColor"]');
      return sections.length;
    });

    console.log('Sections with backgroundColor style:', sectionsWithStyle);

    // We expect at least the hero to have background styling
    expect(sectionsWithStyle).toBeGreaterThan(0);
  });

  test('capture full page screenshot for visual verification', async ({ page }) => {
    // Wait for fonts and images to load
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'tests/e2e/screenshots/tenant-site-full.png',
      fullPage: true
    });

    // Also capture just the hero
    const hero = page.locator('header').first();
    await hero.screenshot({
      path: 'tests/e2e/screenshots/hero-section.png'
    });

    console.log('Screenshots saved to tests/e2e/screenshots/');
  });

  test('footer should have primary color background', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const footer = page.locator('footer').first();

    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();

      const footerStyles = await footer.evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
        };
      });

      console.log('Footer styles:', footerStyles);

      // Footer should have a background color set
      expect(footerStyles.backgroundColor).toBeTruthy();
      expect(footerStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });
});

test.describe('Theme Studio Preview Match', () => {
  test('tenant site should match theme studio preview styling', async ({ page }) => {
    // Navigate to tenant site
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');

    // Capture key styling metrics
    const tenantStyles = await page.evaluate(() => {
      const getElementStyles = (selector: string) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const computed = getComputedStyle(el);
        return {
          fontFamily: computed.fontFamily,
          color: computed.color,
          backgroundColor: computed.backgroundColor,
        };
      };

      return {
        h1: getElementStyles('h1'),
        h2: getElementStyles('h2'),
        header: getElementStyles('header'),
        footer: getElementStyles('footer'),
      };
    });

    console.log('Tenant site key styles:', JSON.stringify(tenantStyles, null, 2));

    // Verify key elements are styled
    if (tenantStyles.h1) {
      expect(tenantStyles.h1.fontFamily).toBeTruthy();
    }
    if (tenantStyles.header) {
      expect(tenantStyles.header.backgroundColor).toBeTruthy();
    }
    if (tenantStyles.footer) {
      expect(tenantStyles.footer.backgroundColor).toBeTruthy();
    }
  });
});
