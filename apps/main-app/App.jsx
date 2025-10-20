import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../../shared-ui/components/Header';
import Button from '../../shared-ui/components/Button';

const App = () => (
  <div>
    <Header />
    <Button>Home</Button>
    <Routes>
      <Route path="/" element={<div>Welcome to Azora OS</div>} />
      {/* Add more routes as needed */}
    </Routes>
  </div>
);

export default App;
