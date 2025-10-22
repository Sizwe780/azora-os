/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

let flags = {
  "aiAssistant": true,
  "darkMode": true,
  "experimentalUI": false
};

app.get('/flags', (_,res) => res.json(flags));
app.post('/flags', (req,res) => {
  flags = {...flags, ...req.body};
  res.json(flags);
});
app.get('/flags/:flag', (req,res) => {
  res.json({ value: flags[req.params.flag] === undefined ? null : flags[req.params.flag] });
});

app.listen(3400, () => console.log("FeatureFlags running on 3400"));
