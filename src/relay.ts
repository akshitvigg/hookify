import express from "express"
import { createServer, request } from "http"
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = createServer(app)

const wss = new WebSocketServer({ server })

let activeAgent: WebSocket | null = null;
const pendingRequest = new Map<string, any>();

app.all("*splat", (req, res) => {
  console.log(`Incoming HTTP request: ${req.method} ${req.url}`)


  if (!activeAgent) {
    return res.status(502).send("Tunnel offline: No agent connected");
  }

  const requestId = crypto.randomUUID();
  pendingRequest.set(requestId, res);

  const payload = {
    id: requestId,
    method: req.method,
    url: req.url
  }

  activeAgent.send(JSON.stringify(payload))
})

wss.on('connection', (ws: WebSocket) => {
  console.log("Agent connected to the tunnel")
  activeAgent = ws;

  ws.on('message', (data: Buffer) => {
    try {


    } catch (error) {

    }
  })
})


server.listen(4000, () => {
  console.log("Relay server running on 4000")
})
