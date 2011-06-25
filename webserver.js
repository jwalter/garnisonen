require("jade");
var app = require("express").createServer();

app.set("view engine", "jade");
app.get("/", function(req, res) {
    res.render("index");
});

app.listen(process.env.C9_PORT);