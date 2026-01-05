// Azora Companion - Background Service
// Layer 3: The Agentic Engine

import { checkGuardrails } from './guardrails.js';

console.log("Azora Companion: Initializing Agentic Link...");

// Connection to Native Host (Vivobook AI Sidepanel)
const port = browser.runtime.connectNative("com.azora.sidepanel");

port.onMessage.addListener((response) => {
    console.log("Received from AI Sidepanel:", response);
});

// Listener for TABS API (Agentic Actions)
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 1. Twin Pact Guardrails Check
    if (!checkGuardrails(message, sender)) {
        console.warn("Blocked by Twin Pact Guardrails");
        return Promise.resolve({ status: "BLOCKED", reason: "Ethical Violation" });
    }

    // 2. Execute Action
    if (message.type === "EXECUTE_ACTION") {
        console.log(`[Agent] Executing action: ${message.action} on target: ${message.target}`);

        // Forward to Native Host for logging/audit
        port.postMessage({ type: "AUDIT_LOG", action: message.action, target: message.target });

        if (message.action === "click") {
            browser.scripting.executeScript({
                target: { tabId: sender.tab ? sender.tab.id : message.tabId },
                func: (selector) => document.querySelector(selector).click(),
                args: [message.target]
            });
        } else if (message.action === "type") {
            browser.scripting.executeScript({
                target: { tabId: sender.tab ? sender.tab.id : message.tabId },
                func: (selector, text) => {
                    const el = document.querySelector(selector);
                    el.value = text;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                },
                args: [message.target, message.value]
            });
        }

        sendResponse({ status: "SUCCESS", agent: "Elara" });
    }

    if (message.type === "SCRAPE_CONTENT") {
        console.log("[Agent] Scraping content for Sankofa Engine...");

        browser.scripting.executeScript({
            target: { tabId: sender.tab ? sender.tab.id : message.tabId },
            func: () => document.body.innerText
        }).then(results => {
            const content = results[0].result;
            // Send to AI for processing
            port.postMessage({ type: "ANALYZE_CONTENT", content: content });
            sendResponse({ status: "SUCCESS", data: content.substring(0, 100) + "..." });
        });

        return true; // Keep channel open for async response
    }

    // Sankofa Search Query from Sidepanel
    if (message.type === "SEARCH_SANKOFA") {
        console.log(`[Sankofa] Searching for: ${message.query}`);
        port.postMessage({ type: "SEARCH_QUERY", query: message.query });
        // We need to wait for the port response to send back to sidepanel, 
        // but for simplicity in this prototype, we'll assume the native host sends a message back 
        // that we might forward, or we rely on the port listener.
        // Actually, for a request-response flow with native messaging, it's async.
        // Let's just return a placeholder or handle it via port.onMessage if we were building a full app.
        // For now, let's just acknowledge.
        return true;
    }
});

// Auto-Indexing (Sankofa Search)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('about:')) {
        // 1. Guardrails Check (Pre-Index)
        // We reuse the checkGuardrails logic but pass a mock sender object
        if (!checkGuardrails({ type: "SCRAPE_CONTENT" }, { tab: tab })) {
            console.log(`[Sankofa] Indexing skipped for ${tab.url} (Guardrails)`);
            return;
        }

        console.log(`[Sankofa] Indexing ${tab.url}...`);

        browser.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                return {
                    title: document.title,
                    content: document.body.innerText,
                    url: document.location.href
                };
            }
        }).then(results => {
            if (results && results[0] && results[0].result) {
                const data = results[0].result;
                // Send to Native Host for Vector Storage
                port.postMessage({
                    type: "INDEX_CONTENT",
                    url: data.url,
                    title: data.title,
                    content: data.content
                });
            }
        }).catch(err => console.error("[Sankofa] Indexing failed:", err));
    }
});
