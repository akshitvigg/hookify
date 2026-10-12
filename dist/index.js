import express from "express";
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Hello this is a plain text");
});
app.get("/json", (req, res) => {
    res.json({
        message: "hello this is a json response"
    });
});
app.listen(3000, () => {
    console.log("server started");
});
//# sourceMappingURL=index.js.map