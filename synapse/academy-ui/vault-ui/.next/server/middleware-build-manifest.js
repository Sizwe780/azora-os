/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

globalThis.__BUILD_MANIFEST = {
  "pages": {
    "/_app": []
  },
  "devFiles": [],
  "ampDevFiles": [],
  "polyfillFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "ampFirstPages": []
};
globalThis.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];