/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

const App = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(0);
  const [azrContract, setAzrContract] = useState(null);

  const AZR_ABI = [/* ERC20 ABI */];
  const AZR_ADDRESS = '0x...'; // Replace with deployed address

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => setAccount(accounts[0]));
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(AZR_ADDRESS, AZR_ABI, signer);
      setAzrContract(contract);
      const bal = await contract.balanceOf(accounts[0]);
      setBalance(ethers.formatEther(bal));
    }
  };

  const mintReward = async () => {
    if (azrContract) {
      const tx = await azrContract.mintReward(account, ethers.parseEther('10'));
      await tx.wait();
      const bal = await azrContract.balanceOf(account);
      setBalance(ethers.formatEther(bal));
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Azora OS</h1>
        {!account ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div>
            <p>Account: {account}</p>
            <p>AZR Balance: {balance}</p>
            <button onClick={mintReward}>Mint Reward</button>
          </div>
        )}
      </header>
    </div>
  );
};

export default App;
