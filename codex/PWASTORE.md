# Azora OS App Store / Play Store Packaging

## Automated packaging with [PWABuilder](https://www.pwabuilder.com/):

1. Go to https://www.pwabuilder.com/ and enter your live app URL.
2. Validate manifest and service worker.
3. Download Android (APK/AAB) and Windows packaging.
4. For iOS:
   - Use manifest, icons, and splash screens here.
   - Add to Home via Safari, or use [PWABuilder iOS instructions](https://docs.pwabuilder.com/#/iOS).

## Play Store:
- Upload the AAB/APK from PWABuilder, follow Play Console steps.

## App Store:
- Use Trusted Web Activity or Cordova/Capacitor for full packaging.
- Review [Apple PWA guidelines](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html).
