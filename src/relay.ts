import express from "express"
import { createServer } from "http"
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = createServer(app)

const wss = new WebSocketServer({ server })


app.all("*splat", (req, res) => {
  console.log(`Incoming HTTP request: ${req.method} ${req.url}`)

  res.send("Relay received your request")
})

wss.on('connection', (ws: WebSocket) => {
  console.log("Agent connected to the tunnel")
})


server.listen(4000, () => {
  console.log("Relay server running on 4000")
})
