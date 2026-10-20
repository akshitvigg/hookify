import WebSocket from "ws"

const ws = new WebSocket("ws://localhost:4000/_tunnel")

ws.on('open', () => {
  console.log("connection established");
})


ws.on('message', async (data: Buffer) => {
  let userId;

  try {
    const requestData = JSON.parse(data.toString())
    const { id, method, url, headers, base64Body } = requestData;
    userId = id;

    const fetchOptions: any = {
      method: method,
      headers: headers
    }

    if (base64Body && base64Body.length > 0 && method !== "GET" && method !== "HEAD") {
      fetchOptions.body = Buffer.from(base64Body, 'base64');
    }


    const response = await fetch("http://localhost:3000" + url, fetchOptions)
    const arrayBuffer = await response.arrayBuffer()
    const base64String = Buffer.from(arrayBuffer).toString('base64')
    const plainHeaders = Object.fromEntries(response.headers.entries())

    ws.send(JSON.stringify({ id: id, body: base64String, status: response.status, headers: plainHeaders }))
  } catch (error) {
    console.log(`Failed to parse incoming WebSocket message ${error}`)
    ws.send(JSON.stringify({ id: userId, body: "Server error", status: 502 }))
  }
})
