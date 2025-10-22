/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Shield service listening on port ${config.port}`);
});
