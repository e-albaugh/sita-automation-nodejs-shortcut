import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

export async function authenticateAndGetSessionCookie() {
    try {
        console.log("Authenticating with ValueEdge...");

        // Step 1: Login to get session cookies (replace with your endpoint)
        const loginResponse = await client.post(
            `${process.env.VALUEEDGE_BASE_URL}/authentication/sign_in`,
            {
                client_id: process.env.VALUEEDGE_CLIENT_ID,
                client_secret: process.env.VALUEEDGE_CLIENT_SECRET
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        console.log("Login response:", loginResponse.data);

        // Check if cookies are set in the jar
        const cookies = await jar.getCookies(`${process.env.VALUEEDGE_BASE_URL}`);
        const lwSSOCookie = cookies.find(cookie => cookie.key === 'LWSSO_COOKIE_KEY');
        console.log("Cookies after login:", cookies);

        if (lwSSOCookie) {
            console.log("LWSSO_COOKIE_KEY obtained:", lwSSOCookie.value);
            return lwSSOCookie.value;
        } else {
            throw new Error("LWSSO_COOKIE_KEY not found in cookies after login.");
        }
    } catch (error) {
        console.error("Error authenticating:", error.message);
        throw error;
    }
}


export async function updateManualActionStatus(lwSSOCookieValue, sonarStatus) {
    // Determine the phase ID based on the SonarQube status
    const phaseId = sonarStatus === 'ERROR'
        ? 'phase.process_action.failed'
        : 'phase.process_action.completed';

    // Construct the payload
    const payloadManualActionData = {
        phase: {
            type: "phase",
            id: phaseId
        },
        id: process.env.VALUEEDGE_MANUAL_ACTION_ID
    };

    console.log("Attempting to update Manual Action Status with LWSSO_COOKIE_KEY:", lwSSOCookieValue);
    console.log("Request URL:", `${process.env.VALUEEDGE_API_URL}/processes/${process.env.VALUEEDGE_MANUAL_ACTION_ID}`);
    console.log("Headers:", {
        'Content-Type': 'application/json',
        'LWSSO_COOKIE_KEY': lwSSOCookieValue,
        'ALM-OCTANE-TECH-PREVIEW': 'true'
    });
    console.log("Payload:", JSON.stringify(payloadManualActionData, null, 2));

    try {
        // Send the PUT request with the payload
        const response = await client.put(
            `${process.env.VALUEEDGE_API_URL}/processes/${process.env.VALUEEDGE_MANUAL_ACTION_ID}`,
            payloadManualActionData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'LWSSO_COOKIE_KEY': lwSSOCookieValue,
                    'ALM-OCTANE-TECH-PREVIEW': 'true'
                }
            }
        );

        console.log("Updated Manual Action Status:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating Manual Action Status:", error.message);
        throw error;
    }

    
}

