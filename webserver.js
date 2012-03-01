require('jade');
var express = require('express');
var app = module.exports = express.createServer();
var duoja = require('./du-o-ja');
var brigaden = require('./brigaden');
var dayNames = ['Må', 'Ti', 'On', 'To', 'Fr'];

app.configure(function(){
   app.set('views', __dirname + '/views');
   app.set('view engine', 'jade');
   app.use(express.bodyParser());
   app.use(express.methodOverride());
   app.use(require('stylus').middleware({ src: __dirname + '/public' }));
   app.use(app.router);
   app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
    res.render('index', {title: 'Välj restaurang'});
});

var duojaCached = new CachingScraper(duoja);
var brigadenCached = new CachingScraper(brigaden);

app.get('/du-o-ja', function(req, res) {
  scrapeAndRender(duojaCached, req, res);
});

app.get('/du-o-ja/json', function(req, res) {
  scrapeAndJson(duojaCached, req, res);
});

app.get('/brigaden', function(req, res) {
    scrapeAndRender(brigadenCached, req, res);
});

app.get('/brigaden/json', function(req, res) {
  scrapeAndJson(brigadenCached, req, res);
});

app.get('/test', function(req, res) {
  res.render('test', {title: 'Test'});
});

app.listen(8080);
//app.listen(process.env.C9_PORT);
console.log('Listening on 8080')

function scrapeAndRender(menuScraper, req, res) {
  menuScraper.scrape(req, res, function(dishes, header) {
    renderMenu(res, menuScraper.title(), header, dishes)
    });
}

function scrapeAndJson(menuScraper, req, res) {
  menuScraper.scrape(req, res, function(dishes, header) {
    jsonMenu(res, menuScraper.title(), header, dishes)
    });
}

function renderMenu(res, title, header, dishes) {
  res.render('lunch', {title: title, header: header, dishes: dishes, dayNames: dayNames});
}

function jsonMenu(res, title, header, dishes) {
  res.send({title: title, header: header, dishes: dishes, dayNames: dayNames});
}

function CachingScraper(scraper) {
  this.lastScrapeTime = 0; 
  this.backingScraper = scraper;
  this.scrape = cachingScrape;
  this.cachedDishes;
  this.cachedHeader;
  this.title = function() {
    return this.backingScraper.title();  
  };
}

function cachingScrape(req, res, handler) {
  var currentTime = new Date().getTime();
  var diff = currentTime - this.lastScrapeTime;
  if (diff < 5 * 60 * 1000) {
    console.log('Cached menu is ' + diff + ' ms old, reusing cached one');
    handler(cachedDishes, cachedHeader);
  } else {
    console.log('Cached menu is ' + diff + ' ms old, getting new one');
    this.backingScraper.scrape(req, res, function(dishes, header) {
        cachedDishes = dishes;
        cachedHeader = header;
        handler(dishes, header);
    });      
    this.lastScrapeTime = currentTime;
  }
}