import express from "express";
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
    res.json({
        message: "yes the server is working"
    });
});
app.listen(3000, () => {
    console.log("server started");
});
//# sourceMappingURL=index.js.map