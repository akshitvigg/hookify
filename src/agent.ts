#!/usr/bin/env node
import { Command } from "commander";
const program = new Command();
import WebSocket from "ws"

program
  .name('mytunnel')
  .description('CLI to tunnel your app')
  .version('1.0.0')
  .option('-p, --port <number>', 'port of your local app')
  .option('-s, --server <url>', 'server url', 'ws://localhost:4000')

program.parse(process.argv);

const options = program.opts();
const port = Number(options.port)

if (!options.port || !Number.isFinite(port) || port < 1 || port > 65535) {
  console.error("error: port num can only be a number between 1 and 65535")
  process.exit(1);
}

const serverUrl = options.server.replace(/\/$/, '');

let backOffDelay = 1000;
let activeWs: WebSocket | null = null;

let shuttingDown = false;

process.on('SIGINT', () => {
  shuttingDown = true;

  if (activeWs && activeWs.readyState === WebSocket.OPEN) {
    activeWs.terminate();
  } else {
    process.exit(0);
  }

  setTimeout(() => process.exit(0), 2000);
})

function connect() {
  let pingInterval: NodeJS.Timeout | null = null;
  let pingTimeout: NodeJS.Timeout | null = null;

  if (shuttingDown) return;

  const ws = new WebSocket(`${serverUrl}/_tunnel`)
  activeWs = ws;

  ws.on('open', () => {
    console.log(`Connected to tunnel server at ${serverUrl}`);
    backOffDelay = 1000;

    pingInterval = setInterval(() => {

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }

      if (pingTimeout) {
        clearTimeout(pingTimeout)
      }

      pingTimeout = setTimeout(() => {
        ws.terminate();
      }, 10000)
    }, 30000)
  })

  ws.on('message', async (data: Buffer) => {
    clearTimeout(pingTimeout!)
    let userId;

    try {
      const requestData = JSON.parse(data.toString())
      const { id, method, url, headers, base64Body, type } = requestData;
      userId = id;

      if (type === "pong") {
        console.log("received pong from relay")
        return;
      }

      const fetchOptions: any = {
        method: method,
        headers: headers,
        redirect: "manual"
      }

      if (base64Body && base64Body.length > 0 && method !== "GET" && method !== "HEAD") {
        fetchOptions.body = Buffer.from(base64Body, 'base64');
      }

      const response = await fetch("http://127.0.0.1:" + port + url, fetchOptions)
      const arrayBuffer = await response.arrayBuffer()
      const base64String = Buffer.from(arrayBuffer).toString('base64')
      const plainHeaders = Object.fromEntries(response.headers.entries())

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "response", id: id, body: base64String, status: response.status, headers: plainHeaders }))
      }
    } catch (error) {
      console.log(`Failed to parse incoming WebSocket message ${error}`)
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "error", id: userId, message: String(error) }))
      }
    }
  })

  ws.on('error', (err) => {
    console.error("WebSocket error: ", err.message);
  })

  ws.on('close', (code) => {
    clearInterval(pingInterval!)

    if (pingTimeout) clearTimeout(pingTimeout)

    if (code === 4000) {
      console.log("Another agent took over this tunnel. Exiting")
      process.exit(1);
    }

    if (shuttingDown) {
      process.exit(0);
    } else {
      console.log(`Connection lost. Reconnecting in ${backOffDelay / 1000} seconds...`)

      setTimeout(connect, backOffDelay);

      backOffDelay = Math.min(backOffDelay * 2, 30000);
    }
  })

}

connect();
