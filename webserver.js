require("jade");
var express = require('express');
var scraper = require("scraper");
var app = module.exports = express.createServer();

app.configure(function(){
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.use(express.bodyParser());
   app.use(express.methodOverride());
   app.use(require('stylus').middleware({ src: __dirname + '/public' }));
   app.use(app.router);
   app.use(express.static(__dirname + '/public'));
});
app.get("/", function(req, res) {
    res.render("index");
});

app.get("/lunch", function(req, res) {
    scraper("http://du-o-ja.se/", function(err, jQuery) {
        if (err) {throw err;}
        var menu = "";
        jQuery("p").first().contents().filter("h5").wrap("<h5></h5>").end().
        each(function() {
            menu += jQuery(this).text().trim() + "<BR>";
        });
        res.send(menu);
    });
});

app.listen(process.env.C9_PORT);