import express from "express"
import { createServer } from "http"
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = createServer(app)

const wss = new WebSocketServer({ server })

let activeAgent: WebSocket | null = null;
let localRes: String | null = null;

app.all("*splat", (req, res) => {
  console.log(`Incoming HTTP request: ${req.method} ${req.url}`)


  res.send(localRes);

  if (!activeAgent) return

  const payload = {
    method: req.method,
    url: req.url
  }

  activeAgent.send(JSON.stringify(payload))
})

wss.on('connection', (ws: WebSocket) => {
  console.log("Agent connected to the tunnel")
  activeAgent = ws;

  ws.on('message', (data: Buffer) => {
    localRes = data.toString();
    console.log("got the message", data.toString())
  })
})


server.listen(4000, () => {
  console.log("Relay server running on 4000")
})
