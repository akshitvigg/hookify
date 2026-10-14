import express from "express";
const app = express();
app.use(express.json());
app.get("/", (_, res) => {
    res.status(200).send("Hello this is a plain text");
});
app.get("/json", (req, res) => {
    res.status(200).json({
        message: "hello this is a json response",
        method: req.method,
        another: req.path,
        ano: req.url,
        headers: req.headers
    });
});
app.listen(3000, () => {
    console.log("server started");
});
//# sourceMappingURL=index.js.map