import dotenv from 'dotenv';
dotenv.config();

import { authenticateAndGetSessionCookie, updateManualActionStatus } from './src/updateValueEdge.js';
import { checkSonarStatus } from './src/checkSonarStatus.js';
import { takeScreenshot } from './src/takeScreenshot.js';

async function main() {
    try {
        console.log("Starting authentication...");
        const cookie = await authenticateAndGetSessionCookie();
        console.log("Received LWSSO_COOKIE_KEY:", cookie);
        
        console.log("Proceeding with SonarQube status check...");
        const sonarStatus = await checkSonarStatus();
        console.log("SonarQube Status:", sonarStatus);
        
        console.log("Initializing SonarQube Screenshot...");
        await takeScreenshot();

        console.log("Beginning update to Manual Action...")
        await updateManualActionStatus(cookie, sonarStatus);

    } catch (error) {
        console.error("Error in main function:", error.message);
    }
}

main();