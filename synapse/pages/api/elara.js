/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { unifiedElaraApiHandler } from '../../../genome/agent-tools/index';

/**
 * Unified Elara API Endpoint
 *
 * Supports three modes:
 * - unified: Combined strategic and operational processing (default)
 * - strategic: Elara Core strategic planning only
 * - operational: Elara Agent operational execution only
 *
 * POST /api/elara
 * Body: {
 *   input: string,      // User query or command
 *   mode?: string,      // 'unified' | 'strategic' | 'operational'
 *   context?: object    // Additional context (userId, etc.)
 * }
 */

export default unifiedElaraApiHandler;