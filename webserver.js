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
    res.render("index", {title: "Välj restaurang"});
});
var days = "M�ndagTisdagOnsdagTorsdagFredag";
var dayNames = ["Må", "Ti", "On", "To", "Fr"];
app.get("/du-o-ja", function(req, res) {
    scraper(
        {
            "uri": "http://du-o-ja.se/",
            "encoding": "utf8"
        }
        , function(err, jQuery) {
        if (err) {throw err;}
        var menu = "";
        var menuFound = false;
        var header = "";
        var dishes = new Array();
        var lastRowWasDay = false;
        jQuery("p").first().contents().filter("h5").remove().end().
        each(function() {
            var curText = jQuery(this).text().trim();
            if (!menuFound) {
                menuFound = curText.indexOf("Lunchmeny v.") != -1;
                if (menuFound) {
                    header = curText;
                    menu = "h1 " + curText + "\n";
                }
            }
            if (curText.length > 0) {
                if (lastRowWasDay) {
                    dishes.push(convert(curText));
                    lastRowWasDay = false;
                    console.log("Adding dish: " + curText);
                } else if (menuFound) {
                    console.log("curText=" + curText);
                    lastRowWasDay = days.indexOf(curText) != -1;
                    menu += curText;
                }
            }
        });
        res.render("lunch", {title: "Du-o-ja", header: header, dishes: dishes, dayNames: dayNames});
    });
});

app.listen(process.env.C9_PORT);

function convert(str) {
    return str;
}