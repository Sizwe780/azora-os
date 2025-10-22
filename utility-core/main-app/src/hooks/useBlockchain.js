/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
export async function createWallet() {
  return axios.post("http://localhost:4800/api/blockchain/wallet").then(r=>r.data.wallet);
}
export async function sendTx(from, to, amount) {
  return axios.post("http://localhost:4800/api/blockchain/tx", { from, to, amount }).then(r=>r.data.tx);
}
export async function mintNFT(wallet, meta) {
  return axios.post("http://localhost:4800/api/blockchain/nft", { wallet, meta }).then(r=>r.data.nft);
}
