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

app.post("/echo", (req, res) => {
  const { message } = req.body

  res.status(200).json({
    message: "im 3000 we got your body",
    body: message
  })

})

app.listen(3000, () => {
  console.log("local app started")
})
