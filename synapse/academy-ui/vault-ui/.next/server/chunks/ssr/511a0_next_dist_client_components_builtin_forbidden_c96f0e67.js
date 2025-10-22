/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

module.exports = [
"[project]/synapse/vault-ui/node_modules/next/dist/client/components/builtin/forbidden.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return Forbidden;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/synapse/vault-ui/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime.js [app-rsc] (ecmascript)");
const _errorfallback = __turbopack_context__.r("[project]/synapse/vault-ui/node_modules/next/dist/client/components/http-access-fallback/error-fallback.js [app-rsc] (ecmascript)");
function Forbidden() {
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_errorfallback.HTTPAccessErrorFallback, {
        status: 403,
        message: "This page could not be accessed."
    });
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=forbidden.js.map
}),
];

//# sourceMappingURL=511a0_next_dist_client_components_builtin_forbidden_c96f0e67.js.map