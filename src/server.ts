import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws: WebSocket) => {
  console.log("Server Started")

  ws.on('message', (data: Buffer) => {
    const message = data.toString()
    console.log(`Received: ${message}`)

    console.log(`Hello this is Server`)
  })

  ws.on('close', () => {
    console.log("Client disconnected")
  })

  ws.on('error', (error: Error) => {
    console.log(`WebSocket error ${error}`)
  })
})
