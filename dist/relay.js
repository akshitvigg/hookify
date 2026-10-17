import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
let activeAgent = null;
const pendingRequest = new Map();
app.all("*splat", (req, res) => {
    console.log(`Incoming HTTP request: ${req.method} ${req.url}`);
    if (!activeAgent) {
        return res.status(502).send("Tunnel offline: No agent connected");
    }
    const requestId = crypto.randomUUID();
    pendingRequest.set(requestId, res);
    const payload = {
        id: requestId,
        method: req.method,
        url: req.url
    };
    activeAgent.send(JSON.stringify(payload));
});
wss.on('connection', (ws) => {
    console.log("Agent connected to the tunnel");
    activeAgent = ws;
    ws.on('message', (data) => {
        try {
            const responseData = JSON.parse(data.toString());
            const { id, body, status } = responseData;
            const vistorRes = pendingRequest.get(id);
            if (vistorRes) {
                if (status === 502) {
                    vistorRes.status(502).send(body);
                }
                else {
                    vistorRes.send(body);
                }
                pendingRequest.delete(id);
            }
        }
        catch (err) {
            console.log("Failed to process agent message:", err);
        }
    });
});
server.listen(4000, () => {
    console.log("Relay server running on 4000");
});
//# sourceMappingURL=relay.js.map