const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");

const app = express();
app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ noServer: true });
wss.on("connection", (ws) => {
  ws.on("message", (data) => {
    if (Buffer.isBuffer(data)) {
      ws.send(JSON.stringify({ type: "partial", text: "..." }));
      ws.send(JSON.stringify({ type: "final", text: "Where are gluten-free wraps?", confidence: 0.86 }));
    }
  });
});

app.post("/tts", async (_req, res) => { res.json({ audioBase64: "", voice: "Browser-TTS" }); });
const server = app.listen(process.env.PORT || 4010, () => console.log("Voice service :4010"));
server.on("upgrade", (req, socket, head) => {
  if (req.url && req.url.startsWith("/ws/audio")) wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  else socket.destroy();
});
