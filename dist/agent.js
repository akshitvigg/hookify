import WebSocket from "ws";
const ws = new WebSocket("ws://localhost:4000");
ws.on('open', () => {
    console.log("connection established");
});
ws.on('message', async (data) => {
    try {
        const requestData = JSON.parse(data.toString());
        const method = requestData.method;
        const url = requestData.url;
        console.log(`received ${method} ${url}`);
        const response = await fetch("http://localhost:3000");
        const text = await response.text();
        ws.send(text);
        console.log(`local app sent ${text}`);
    }
    catch (error) {
        console.log(`Failed to parse incoming WebSocket message ${error}`);
    }
});
//# sourceMappingURL=agent.js.map