/**
 * Payment Service
 * Handles API integration for Waafi Pay, eDahab, and EVC Plus.
 */

// Waafi: VITE_WAAFI_API_URL, VITE_WAAFI_MERCHANT_UID, VITE_WAAFI_API_KEY, VITE_WAAFI_STORE_ID
// eDahab: VITE_EDAHAB_API_URL, VITE_EDAHAB_API_KEY, VITE_EDAHAB_SECRET_KEY, VITE_EDAHAB_AGENT_CODE

// Helper for SHA256 hashing (Required for eDahab)
async function generateSha256(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export const processPayment = async (method, amount, phoneNumber) => {
    console.log(`[DEBUG] Processing ${method} payment for ${amount} to ${phoneNumber}`);

    try {
        // Map EVC to Waafi logic as it serves as the gateway
        if (method === 'evc' || method === 'waafi') {
            const body = {
                schemaVersion: "1.0",
                requestId: Date.now().toString(),
                timestamp: Date.now().toString(),
                channelName: "WEB",
                serviceName: "API_PURCHASE",
                serviceParams: {
                    merchantUid: import.meta.env.VITE_WAAFI_MERCHANT_UID,
                    apiKey: import.meta.env.VITE_WAAFI_API_KEY,
                    storeId: import.meta.env.VITE_WAAFI_STORE_ID,
                    transactionId: "TRX" + Date.now(),
                    paymentMethod: "MWALLET_ACCOUNT",
                    payerInfo: {
                        accountNo: phoneNumber
                    },
                    transactionInfo: {
                        amount: amount.toString(),
                        currency: "USD",
                        description: "Course Enrollment"
                    }
                }
            };

            console.log("[DEBUG] Waafi/EVC Request Body:", JSON.stringify(body, null, 2));

            const response = await fetch(import.meta.env.VITE_WAAFI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }).catch(err => {
                console.error("[DEBUG] Waafi/EVC Fetch Error (CORS?):", err);
                throw new Error("Network error or CORS issue. Please check the console.");
            });

            if (!response.ok) {
                console.error("[DEBUG] Waafi/EVC Response Not OK:", response.status, response.statusText);
            }

            const data = await response.json();
            console.log("[DEBUG] Waafi/EVC Response Data:", data);

            if (data.responseCode === "2001") {
                return { success: true, message: 'Payment processed successfully' };
            } else {
                return { success: false, message: data.responseMsg || 'Waafi/EVC payment failed' };
            }
        }

        if (method === 'edahab') {
            const body = {
                apiKey: import.meta.env.VITE_EDAHAB_API_KEY,
                edahabNumber: phoneNumber,
                amount: amount.toString(),
                currency: "USD",
                agentCode: import.meta.env.VITE_EDAHAB_AGENT_CODE,
                ReturnUrl: window.location.origin // Capitalized R as per standard eDahab
            };

            const bodyString = JSON.stringify(body);
            const hash = await generateSha256(bodyString + import.meta.env.VITE_EDAHAB_SECRET_KEY);
            const url = `${import.meta.env.VITE_EDAHAB_API_URL}?hash=${hash}`;

            console.log("[DEBUG] eDahab Request Body:", bodyString);
            console.log("[DEBUG] eDahab Request URL:", url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: bodyString
            }).catch(err => {
                console.error("[DEBUG] eDahab Fetch Error (CORS?):", err);
                throw new Error("Network error or CORS issue. Please check the console.");
            });

            if (!response.ok) {
                console.error("[DEBUG] eDahab Response Not OK:", response.status, response.statusText);
            }

            const data = await response.json();
            console.log("[DEBUG] eDahab Response Data:", data);

            if (data.StatusCode === 0 || data.success === true) {
                return { success: true, message: 'Payment processed successfully' };
            } else {
                return { success: false, message: data.StatusDescription || 'eDahab payment failed' };
            }
        }

        return { success: false, message: 'Unknown payment method' };
    } catch (error) {
        console.error('[DEBUG] Payment Service Exception:', error);
        return { success: false, message: error.message };
    }
};
