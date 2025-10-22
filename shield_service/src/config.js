/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

module.exports = {
  quantumService: {
    url: process.env.QUANTUM_SERVICE_URL || 'http://quantum_microservice:5000'
  },
  port: process.env.PORT || 3000
};
