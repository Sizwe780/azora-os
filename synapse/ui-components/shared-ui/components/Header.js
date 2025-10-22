/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import React from 'react';
import Button from './Button';
import './Header.css';

const Header = ({ title, user }) => (
  <header className="azora-header">
    <h1>{title}</h1>
    <div className="user-info">
      <span>Welcome, {user.name}</span>
      <Button variant="secondary" onClick={() => alert('Logout')}>Logout</Button>
    </div>
  </header>
);

export default Header;
