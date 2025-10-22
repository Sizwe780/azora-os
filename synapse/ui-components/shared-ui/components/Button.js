/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import React from 'react';
import './Button.css';

const Button = ({ children, onClick, variant = 'primary' }) => (
  <button className={`azora-btn ${variant}`} onClick={onClick}>
    {children}
  </button>
);

export default Button;
