// Twin Pact Guardrails
// Layer 3: Ethics Monitor

const BLACKLIST = [
    "example.com",
    "malicious-site.test",
    "tracking-pixel.com"
];

const SENSITIVE_DATA_REGEX = /password|credit_card|ssn|private_key/i;

export function checkGuardrails(message, sender) {
    // 1. Domain Check
    if (sender.tab && sender.tab.url) {
        const url = new URL(sender.tab.url);
        if (BLACKLIST.some(domain => url.hostname.includes(domain))) {
            console.error(`[Guardrails] Access to blacklisted domain blocked: ${url.hostname}`);
            return false;
        }
    }

    // 2. Sensitive Data Extraction Check
    if (message.type === "SCRAPE_CONTENT" || message.type === "EXECUTE_ACTION") {
        // If the agent tries to type or extract something that looks like sensitive data
        if (message.value && SENSITIVE_DATA_REGEX.test(message.value)) {
            console.error("[Guardrails] Sensitive data interaction blocked.");
            return false;
        }
    }

    return true;
}
