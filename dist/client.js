import WebSocket from "ws";
const ws = new WebSocket("ws://localhost:8080");
ws.on('open', () => {
    console.log("Connected to the server");
    ws.send("Hello from the client");
});
ws.on('message', (data) => {
    console.log(`Message from the server ${data.toString()}`);
});
ws.on('close', () => {
    console.log("Disconnected from the Server");
});
ws.on('error', (error) => {
    console.log(`WebSocket error ${error}`);
});
//# sourceMappingURL=client.js.map