import { Command } from "commander";
const program = new Command();
import WebSocket from "ws";
program
    .name('tunnel app')
    .description('CLI to tunnel your app')
    .version('1.0.0');
program
    .option('-p, --port <number>', 'port of your local app')
    .option('-s, --server [url]', 'server url', 'ws://localhost:4000');
program.parse(process.argv);
const options = program.opts();
const port = Number(options.port);
if (!options.port || !Number.isFinite(port) || port < 1 || port > 65535) {
    console.error("error: port num can only be a number between 1 and 65535");
    process.exit(1);
}
console.log(options.port, " ", options.server);
let backOffDelay = 1000;
function connect() {
    const ws = new WebSocket(`${options.server}/_tunnel`);
    ws.on('open', () => {
        console.log("connection established");
        backOffDelay = 1000;
    });
    ws.on('message', async (data) => {
        let userId;
        try {
            const requestData = JSON.parse(data.toString());
            const { id, method, url, headers, base64Body } = requestData;
            userId = id;
            const fetchOptions = {
                method: method,
                headers: headers,
                redirect: "manual"
            };
            if (base64Body && base64Body.length > 0 && method !== "GET" && method !== "HEAD") {
                fetchOptions.body = Buffer.from(base64Body, 'base64');
            }
            const response = await fetch("http://localhost:" + port + url, fetchOptions);
            const arrayBuffer = await response.arrayBuffer();
            const base64String = Buffer.from(arrayBuffer).toString('base64');
            const plainHeaders = Object.fromEntries(response.headers.entries());
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "response", id: id, body: base64String, status: response.status, headers: plainHeaders }));
            }
        }
        catch (error) {
            console.log(`Failed to parse incoming WebSocket message ${error}`);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "error", id: userId, message: String(error) }));
            }
        }
    });
    ws.on('error', (err) => {
        console.error("WebSocket error: ", err.message);
    });
    ws.on('close', () => {
        console.log(`Connection lost. Reconnecting in ${backOffDelay / 1000} seconds...`);
        setTimeout(connect, backOffDelay);
        backOffDelay = Math.min(backOffDelay * 2, 30000);
    });
}
connect();
//# sourceMappingURL=agent.js.map