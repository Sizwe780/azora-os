/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import React from 'react';
import Header from '../../shared-ui/components/Header';
import Button from '../../shared-ui/components/Button';

const DriverApp = () => (
  <div>
    <Header title="Azora Driver" user={{ name: 'DriverUser' }} />
    <Button onClick={() => console.log('Track shipment')}>Track Shipment</Button>
    {/* App-specific content */}
  </div>
);

export default DriverApp;import Header from '../../shared-ui/components/Header';
import Button from '../../shared-ui/components/Button';
