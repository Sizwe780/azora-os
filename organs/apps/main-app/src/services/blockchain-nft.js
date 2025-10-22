/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import axios from "axios";
const BASE_URL = process.env.REACT_APP_BLOCKCHAIN-NFT_URL || "http://localhost:3022";

export async function fetchBlockchainNft(payload = {}) {
  const r = await axios.post(`${BASE_URL}/api/blockchain-nft`, payload);
  return r.data;
}
