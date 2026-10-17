import express from "express"

const app = express()

app.use(express.json())

app.get("/", (_, res) => {
  res.send("Hello from my local app on port 3000!")
})

app.get("/time", (_, res) => {
  setTimeout(() => {
    res.send("40 sec pass")
  }, 40000)
})

app.listen(3000, () => {
  console.log("local app started")
})
