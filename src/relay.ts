import express from "express"
import { createServer } from "http"
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = createServer(app)

const wss = new WebSocketServer({ server, path: "/_tunnel" })

let activeAgent: WebSocket | null = null;
const pendingRequest = new Map<string, any>();

app.all("/{*splat}", (req, res) => {
  console.log(`Incoming HTTP request: ${req.method} ${req.url}`)


  if (!activeAgent) {
    return res.status(502).send("Tunnel offline: No agent connected");
  }

  const requestId = crypto.randomUUID();

  const timer = setTimeout(() => {
    let visitorRes = pendingRequest.get(requestId);
    if (visitorRes) {
      visitorRes.res.status(504).send("Gateway Timeout")
    }
    pendingRequest.delete(requestId);
  }, 30000)

  pendingRequest.set(requestId, { res, timer });

  let bodyChunks: Buffer[] = [];

  req.on('data', (chunks) => {
    bodyChunks.push(chunks);
  })

  req.on('end', () => {
    const rawBodyBuffer = Buffer.concat(bodyChunks);
    const base64Body = rawBodyBuffer.toString('base64')

    const cleanHeaders = { ...req.headers }
    delete cleanHeaders['host']
    delete cleanHeaders['connection']
    delete cleanHeaders['upgrade']
    delete cleanHeaders['keep-alive']
    delete cleanHeaders['proxy-authenticate']
    delete cleanHeaders['proxy-authorization']
    delete cleanHeaders['te']
    delete cleanHeaders['trailers']
    delete cleanHeaders['transfer-encoding']

    const payload = {
      id: requestId,
      method: req.method,
      url: req.url,
      headers: cleanHeaders,
      base64Body: base64Body
    }

    if (activeAgent?.readyState !== WebSocket.OPEN) {
      return;
    }
    activeAgent!.send(JSON.stringify(payload))
  })
})

wss.on('connection', (ws: WebSocket) => {
  console.log("Agent connected to the tunnel")
  activeAgent = ws;

  ws.on('message', (data: Buffer) => {
    try {
      const responseData = JSON.parse(data.toString())
      const { id, body, status } = responseData;

      const vistorRes = pendingRequest.get(id);

      if (vistorRes) {
        clearTimeout(vistorRes.timer)

        if (status === 502) {
          vistorRes.res.status(502).send(body)
        } else {
          vistorRes.res.send(body)
        }
        pendingRequest.delete(id)
      }
    } catch (err) {
      console.log("Failed to process agent message:", err)
    }
  })

  ws.on('close', () => {
    if (activeAgent === ws) {
      activeAgent = null;
    }
  })
})


server.listen(4000, () => {
  console.log("Relay server running on 4000")
})
