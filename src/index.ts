import express from "express"

const app = express();

app.use(express.json())


app.get("/", (_, res) => {
  res.send("Hello this is a plain text")
})

app.get("/json", (_, res) => {
  res.json
    ({
      message: "hello this is a json response"
    })

})

app.listen(3000, () => {
  console.log("server started")
})


