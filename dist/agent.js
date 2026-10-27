import { Command } from "commander";
const program = new Command();
import WebSocket from "ws";
program
    .name('tunnel app')
    .description('CLI to tunnel your app')
    .version('1.0.0');
program
    .option('-p , --port', 'port of your local app')
    .option('s, --server [url]', 'server url', 'ws://localhost:4000');
program.parse(process.argv);
const options = program.opts();
if (!Number.isFinite(options.port) || options.port < 1 || options.port > 65535) {
    console.error("error: port num can only be a number between 1 and 65535");
    process.exit(1);
}
console.log(options.port, " ", options.server);
const ws = new WebSocket("ws://localhost:4000/_tunnel");
ws.on('open', () => {
    console.log("connection established");
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
        const response = await fetch("http://localhost:3000" + url, fetchOptions);
        const arrayBuffer = await response.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString('base64');
        const plainHeaders = Object.fromEntries(response.headers.entries());
        ws.send(JSON.stringify({ type: "response", id: id, body: base64String, status: response.status, headers: plainHeaders }));
    }
    catch (error) {
        console.log(`Failed to parse incoming WebSocket message ${error}`);
        ws.send(JSON.stringify({ type: "error", id: userId, message: String(error) }));
    }
});
//# sourceMappingURL=agent.js.map