import React, { useState } from "react";
import { createWallet, sendTx, mintNFT } from "../hooks/useBlockchain";

export default function BlockchainPanel() {
  const [wallet, setWallet] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState(1);
  const [nft, setNFT] = useState(null);

  return (
    <div className="card fade-in">
      <h3>Blockchain Panel</h3>
      <button className="btn-primary" onClick={async()=>setWallet(await createWallet())}>Create Wallet</button>
      <div>Wallet: {wallet}</div>
      <div>
        <input className="input" placeholder="To" value={to} onChange={e=>setTo(e.target.value)}/>
        <input className="input" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/>
        <button className="btn-secondary" onClick={async()=>alert(await sendTx(wallet, to, amount))}>Send</button>
      </div>
      <div>
        <button className="btn-secondary" onClick={async()=>setNFT(await mintNFT(wallet, { name: "Azora NFT" }))}>Mint NFT</button>
        {nft && <div>NFT Minted: #{nft.tokenId}</div>}
      </div>
    </div>
  );
}
