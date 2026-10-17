import WebSocket from "ws"

const ws = new WebSocket("ws://localhost:4000")

ws.on('open', () => {
  console.log("connection established");
})


ws.on('message', async (data: Buffer) => {
  let userId;

  try {
    const requestData = JSON.parse(data.toString())
    const { id, method, url } = requestData;
    userId = id;

    console.log(`received ${method} ${url} from id: ${id}`)

    const response = await fetch("http://localhost:3000")
    const text = await response.text();

    ws.send(JSON.stringify({ id: id, body: text, status: 200 }))
  } catch (error) {
    console.log(`Failed to parse incoming WebSocket message ${error}`)
    ws.send(JSON.stringify({ id: userId, body: "Server error", status: 502 }))
  }
})
