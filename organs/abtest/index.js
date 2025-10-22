/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const app = express();
app.use(express.json());

const variants = ["A", "B"];
const buckets = {};

app.get('/abtest/:user', (req, res) => {
  const user = req.params.user;
  if (!buckets[user]) {
    buckets[user] = Math.random() > 0.5 ? "A" : "B";
  }
  res.json({ variant: buckets[user] });
});

app.listen(3300, () => console.log("A/B Test Service running on 3300"));
