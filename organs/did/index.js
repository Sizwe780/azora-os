/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const { createJWT, verifyJWT } = require('did-jwt');
const { EdDSASigner, EdDSAVerifier } = require('did-jwt');
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const app = express();
app.use(express.json());

const keypair = nacl.sign.keyPair();
const did = "did:key:" + bs58.encode(keypair.publicKey);

app.get('/api/did', (_, res) => {
  res.json({ did, pub: bs58.encode(keypair.publicKey) });
});

app.post('/api/did/jwt', async (req, res) => {
  const jwt = await createJWT(
    req.body,
    { issuer: did, signer: EdDSASigner(bs58.encode(keypair.secretKey)) },
    { alg: 'EdDSA' }
  );
  res.json({ jwt });
});

app.post('/api/did/verify', async (req, res) => {
  try {
    const verified = await verifyJWT(req.body.jwt, { resolver: () => ({ didResolutionMetadata: {}, didDocument: { publicKey: [{ id: did, type: 'Ed25519VerificationKey2018', publicKeyBase58: bs58.encode(keypair.publicKey) }] } }) });
    res.json({ payload: verified.payload });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.listen(5600, () => console.log("[did] running on 5600"));
