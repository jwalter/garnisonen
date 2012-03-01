var scraper = require('scraper');
var days2 = 'Måndag:Tisdag:Onsdag:Torsdag:Fredag:';

exports.scrape = function (req, res, resultHandler) {
  scraper(
  {
    'uri': 'http://www.brigaden.net/1/1.0.1.0/26/1/',
    'encoding': 'utf8'
  }
  , 
  function(err, jQuery) {
    if (err) {throw err;}
    parseJQuery(jQuery, resultHandler);
  });
}

exports.title = function() {
  return 'Brigaden';
}

function parseJQuery(jQuery, resultHandler) {
  console.log("Parsing");
  var header = '';
  var dishes = new Array();
  var dishesLeft = 0;
  var dishText = '';
  header = 'Brigaden ' + jQuery('span').find('h2').text().trim();
  jQuery('span').find('p').
    each(function() {
      var curText = jQuery(this).find('strong').text().trim();
      if (curText.length > 0 && days2.indexOf(curText) != -1) {
        console.log('curText=' + curText);
        if (curText === 'Måndag:') {
          dishText = jQuery(this).contents().last().text();
          dishesLeft = 1;
        } else {
          dishesLeft = 2;                    
        }
      } else if (dishesLeft > 0) {
                curText = jQuery(this).text().trim();
                if (dishesLeft == 2) {
                    dishText = curText;
                } else {
                    dishText += '<BR>' + curText;
                    dishes.push(dishText);
                }
                console.log('dish=' + curText);
                dishesLeft--;
            }
            
        });
  resultHandler(dishes, header);
}

function scrapeBrigaden(req, res) {
    scraper(
        {
            'uri': 'http://www.brigaden.net/1/1.0.1.0/26/1/',
            'encoding': 'utf8'
        }
        , function(err, jQuery) {
        var header = '';
        var dishes = new Array();
        if (err) {throw err;}
        var menu = '';
        var menuFound = false;
        var lastRowWasDay = false;
        var dishesLeft = 0;
        var dishText = '';
        header = 'Brigaden ' + jQuery('span').find('h2').text().trim();
        jQuery('span').find('p').
        each(function() {
            var curText = jQuery(this).find('strong').text().trim();//.end().text().trim();
            if (curText.length > 0 && days2.indexOf(curText) != -1) {
                console.log('curText=' + curText);
                if (curText === 'Måndag:') {
                    dishText = jQuery(this).contents().last().text();
                    dishesLeft = 1;
                } else {
                  dishesLeft = 2;                    
                }
            } else if (dishesLeft > 0) {
                curText = jQuery(this).text().trim();
                if (dishesLeft == 2) {
                    dishText = curText;
                } else {
                    dishText += '<BR>' + curText;
                    dishes.push(dishText);
                }
                console.log('dish=' + curText);
                dishesLeft--;
            }
            
        });
        res.render('lunch', {title: 'Brigaden', header: header, dishes: dishes, dayNames: dayNames});
    });
}