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
var days = "MåndagTisdagOnsdagTorsdagFredag";
var days2 = "Måndag:Tisdag:Onsdag:Torsdag:Fredag:";
var dayNames = ["Må", "Ti", "On", "To", "Fr"];
app.get("/du-o-ja", function(req, res) {
    scrapeDuOJa(req, res);
});
app.get("/brigaden", function(req, res) {
    scrapeBrigaden(req, res);
});

app.listen(8080);

function scrapeDuOJa(req, res) {
    scraper(
        {
            "uri": "http://du-o-ja.se/",
            "encoding": "binary"
        }
        , function(err, jQuery) {
        var header = "";
        var dishes = new Array();
        if (err) {throw err;}
        var menu = "";
        var menuFound = false;
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
                    dishes.push(curText);
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
}

function scrapeBrigaden(req, res) {
    scraper(
        {
            "uri": "http://www.brigaden.net/1/1.0.1.0/26/1/",
            "encoding": "utf8"
        }
        , function(err, jQuery) {
        var header = "";
        var dishes = new Array();
        if (err) {throw err;}
        var menu = "";
        var menuFound = false;
        var lastRowWasDay = false;
        var dishesLeft = 0;
        var dishText = "";
        header = jQuery("span").find("h2").text().trim();
        jQuery("span").find("p").
        each(function() {
            var curText = jQuery(this).find("strong").text().trim();//.end().text().trim();
            if (curText.length > 0 && days2.indexOf(curText) != -1) {
                console.log("curText=" + curText);
                dishesLeft = 2;
            } else if (dishesLeft > 0) {
                curText = jQuery(this).text().trim();
                if (dishesLeft == 2) {
                    dishText = curText;
                } else {
                    dishText += "<BR>" + curText;
                    dishes.push(dishText);
                }
                console.log("dish=" + curText);
                dishesLeft--;
            }
            
        });
        res.render("lunch", {title: "Brigaden", header: header, dishes: dishes, dayNames: dayNames});
    });
}
