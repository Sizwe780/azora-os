// Azrome Network & Privacy Configuration
// Layer 2: The Aethernet Tunnel

// --- Aethernet Bridge ---
// Force DNS to AzVPN CoreDNS
user_pref("network.trr.mode", 3); // TRR Only (DoH)
user_pref("network.trr.uri", "https://10.0.0.1/dns-query"); // Internal DoH
user_pref("network.dns.disableIPv6", true); // Prevent leaks
user_pref("network.proxy.type", 0); // Direct connection (tunneled via OS/VPN)

// --- Privacy Hardening (Tor Aspect) ---
// Anti-Fingerprinting
user_pref("privacy.resistFingerprinting", true);
user_pref("privacy.resistFingerprinting.letterboxing", true); // Prevent window size fingerprinting

// No-Leak Protocol
user_pref("media.peerconnection.enabled", false); // Disable WebRTC to prevent IP leaks
user_pref("geo.enabled", false); // Disable Geolocation

// Ephemeral State (Permanent Private Browsing)
user_pref("browser.privatebrowsing.autostart", true);
user_pref("privacy.history.custom", true);
user_pref("places.history.enabled", false);
user_pref("browser.formfill.enable", false);

// Isolation
user_pref("privacy.firstparty.isolate", true);
