import express from "express"

const app = express()

app.use(express.json())

app.get("/", (_, res) => {
  res.send("Hello from my local app on port 3000!")
})

app.listen(3000, () => {
  console.log("local app started")
})
