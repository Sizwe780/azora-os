import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>Azora OS</h2>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/wallet">Wallet</Link>
          </li>
          <li>
            <Link to="/wallet/transactions">Transactions</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
