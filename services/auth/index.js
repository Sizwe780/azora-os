const express = require("express");
const cors = require("cors");
const app = express(); app.use(cors()); app.use(express.json());
app.post("/login", (req, res) => { const { userId, role } = req.body || {}; res.json({ token: "demo-token", userId, role, tenant: "woolworths" }); });
app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth" }));
app.listen(process.env.PORT || 4004, () => console.log("Auth service :4004"));
