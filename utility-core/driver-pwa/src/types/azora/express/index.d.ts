/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      uid: string;
      email: string;
      roles: string[];
    };
  }
}
