import puppeteer from 'puppeteer';
import path from 'path';

export async function takeScreenshot() {
    const url = 'https://www.sonarsource.com/products/sonarqube/';  // New URL
    const screenshotPath = path.resolve('./screenshots/sonarqube_screenshot.png');

    try {
        console.log("Launching Puppeteer...");
        
        // Launch browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        console.log(`Navigating to URL: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        console.log("Taking screenshot...");
        await page.screenshot({ path: screenshotPath });
        
        console.log(`Screenshot saved at ${screenshotPath}`);

        // Close browser
        await browser.close();
    } catch (error) {
        console.error("Error taking screenshot:", error.message);
        throw error;
    }
}
